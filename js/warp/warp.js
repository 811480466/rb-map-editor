// ============================================================
// gMapGroups 索引 / Warp 跳转辅助
// ============================================================
function mapGroupKey(mapGroup, mapNum) {
  return `${Number(mapGroup)}:${Number(mapNum)}`;
}

function getGroupArrayOffsets() {
  const arrOffsets = [];

  if (!rom || !isValidOffset(GMAPGROUPS_OFFSET, MAP_GROUP_COUNT * 4)) {
    return arrOffsets;
  }

  for (let group = 0; group < MAP_GROUP_COUNT; group++) {
    const groupArrPtr = readU32(GMAPGROUPS_OFFSET + group * 4);
    const groupArrOff = ptrToOffset(groupArrPtr);

    if (groupArrOff === null || !isValidOffset(groupArrOff, 4)) {
      arrOffsets.push(null);
    } else {
      arrOffsets.push(groupArrOff);
    }
  }

  return arrOffsets;
}

function rebuildMapGroupIndex() {
  mapGroupIndex.clear();
  mapHeaderByOffset.clear();

  for (const h of mapHeaders) {
    h.mapGroup = undefined;
    h.mapNum = undefined;
    h.mapGroupKey = undefined;
    mapHeaderByOffset.set(h.offset, h);
  }

  const groupArrOffsets = getGroupArrayOffsets();
  if (!groupArrOffsets.length) return { validGroups: 0, totalMaps: 0 };

  let validGroups = 0;
  let totalMaps = 0;

  for (let group = 0; group < MAP_GROUP_COUNT; group++) {
    const arrOff = groupArrOffsets[group];
    if (arrOff === null) continue;

    validGroups++;
    const nextArrOff = group + 1 < MAP_GROUP_COUNT ? groupArrOffsets[group + 1] : GMAPGROUPS_OFFSET;
    let mapCount = 0;

    // Run&Bun 1.07 里 group array 通常连续排列；优先用相邻数组距离判断数量。
    if (nextArrOff !== null && nextArrOff > arrOff && (nextArrOff - arrOff) % 4 === 0) {
      mapCount = (nextArrOff - arrOff) / 4;
    } else {
      // 兜底：连续读到第一个无效 MapHeader 指针为止。
      while (isValidOffset(arrOff + mapCount * 4, 4)) {
        const headerPtr = readU32(arrOff + mapCount * 4);
        const headerOff = ptrToOffset(headerPtr);
        if (headerOff === null || !parseMapHeader(headerOff)) break;
        mapCount++;
      }
    }

    for (let mapNum = 0; mapNum < mapCount; mapNum++) {
      const headerPtr = readU32(arrOff + mapNum * 4);
      const headerOff = ptrToOffset(headerPtr);
      if (headerOff === null) continue;

      let header = mapHeaderByOffset.get(headerOff);
      if (!header) {
        // 理论上 scanMapHeaders 会扫到；这里留兜底，避免 gMapGroups 有地图但扫描列表缺失。
        header = parseMapHeader(headerOff);
        if (!header) continue;
        header.id = mapHeaders.length;
        mapHeaders.push(header);
        mapHeaderByOffset.set(headerOff, header);
      }

      header.mapGroup = group;
      header.mapNum = mapNum;
      header.mapGroupKey = mapGroupKey(group, mapNum);
      mapGroupIndex.set(header.mapGroupKey, header);
      totalMaps++;
    }
  }

  return { validGroups, totalMaps };
}

function findMapByGroupNum(mapGroup, mapNum) {
  return mapGroupIndex.get(mapGroupKey(mapGroup, mapNum)) || null;
}

function connectionDirectionName(direction) {
  const names = {
    1: "下 / South",
    2: "上 / North",
    3: "左 / West",
    4: "右 / East",
    5: "潜水 / Dive",
    6: "上浮 / Emerge",
  };
  return names[direction] || `未知方向 ${direction}`;
}

function oppositeConnectionDirection(direction) {
  const opposite = { 1: 2, 2: 1, 3: 4, 4: 3, 5: 6, 6: 5 };
  return opposite[direction] ?? null;
}

function parseMapConnections(connectionsPtr) {
  const connectionsHeaderOff = ptrToOffset(connectionsPtr);
  if (connectionsPtr === 0 || connectionsHeaderOff === null) {
    return {
      ptr: connectionsPtr,
      offset: connectionsHeaderOff,
      count: 0,
      dataPtr: 0,
      dataOff: null,
      list: [],
      status: "none",
    };
  }

  if (!isValidOffset(connectionsHeaderOff, MAP_CONNECTIONS_SIZE)) {
    return {
      ptr: connectionsPtr,
      offset: connectionsHeaderOff,
      count: 0,
      dataPtr: 0,
      dataOff: null,
      list: [],
      status: "invalid-header",
    };
  }

  const count = readS32(connectionsHeaderOff + 0x00);
  const dataPtr = readPtr(connectionsHeaderOff + 0x04);
  const dataOff = ptrToOffset(dataPtr);

  if (count <= 0) {
    return { ptr: connectionsPtr, offset: connectionsHeaderOff, count, dataPtr, dataOff, list: [], status: "empty" };
  }

  if (count > 32 || dataOff === null || !isValidOffset(dataOff, count * MAP_CONNECTION_SIZE)) {
    return { ptr: connectionsPtr, offset: connectionsHeaderOff, count, dataPtr, dataOff, list: [], status: "invalid-data" };
  }

  const list = [];
  for (let i = 0; i < count; i++) {
    const off = dataOff + i * MAP_CONNECTION_SIZE;
    const direction = readU8(off + 0x00);
    const offset = readS32(off + 0x04);
    const mapGroup = readU8(off + 0x08);
    const mapNum = readU8(off + 0x09);
    list.push({
      index: i,
      offset: off,
      direction,
      directionName: connectionDirectionName(direction),
      connectionOffset: offset,
      mapGroup,
      mapNum,
      targetMap: null,
    });
  }

  return { ptr: connectionsPtr, offset: connectionsHeaderOff, count, dataPtr, dataOff, list, status: "ok" };
}

function getConnectionsForMap(header) {
  if (!header) return [];
  if (!header.connectionsParsed) {
    header.connectionsParsed = parseMapConnections(header.connectionsPtr);
  }
  return header.connectionsParsed.list || [];
}

function getConnectionDestinationInfo(conn, fromHeader = currentMap) {
  if (!conn) return null;

  const targetMap = findMapByGroupNum(conn.mapGroup, conn.mapNum);
  const targetConnections = targetMap ? getConnectionsForMap(targetMap) : [];
  const fromGroup = fromHeader?.mapGroup;
  const fromNum = fromHeader?.mapNum;
  const expectedReverseDirection = oppositeConnectionDirection(conn.direction);

  const reverseConnections = targetConnections.filter(c =>
    fromGroup !== undefined &&
    fromNum !== undefined &&
    c.mapGroup === fromGroup &&
    c.mapNum === fromNum
  );
  const exactReverseConnection = expectedReverseDirection === null
    ? null
    : reverseConnections.find(c => c.direction === expectedReverseDirection) || null;

  let status = "unknown";
  let statusText = "未能判断";

  if (!targetMap) {
    status = "bad";
    statusText = "目标地图不存在 / gMapGroups 未命中";
  } else if (exactReverseConnection) {
    status = "ok";
    statusText = `双向连接：目标地图存在 ${connectionDirectionName(exactReverseConnection.direction)} 连接返回当前地图`;
  } else if (reverseConnections.length) {
    status = "warn";
    statusText = `目标地图有 ${reverseConnections.length} 条连接返回当前地图，但方向不是预期的反方向`;
  } else {
    status = "warn";
    statusText = "疑似单向连接：目标地图没有连接返回当前地图";
  }

  return {
    fromMap: fromHeader,
    targetMap,
    targetConnections,
    reverseConnections,
    exactReverseConnection,
    expectedReverseDirection,
    status,
    statusText,
  };
}

function jumpToConnectionTarget(conn) {
  const info = getConnectionDestinationInfo(conn);
  if (!info?.targetMap) return false;
  return selectHeader(info.targetMap, false, null);
}

function getWarpEventsForMap(header) {
  if (!header) return [];
  return loadMapEvents(header).filter(ev => ev.type === "warp");
}

function getWarpDestinationInfo(ev, fromHeader = currentMap) {
  if (!ev || ev.type !== "warp") return null;

  const targetMap = findMapByGroupNum(ev.mapGroup, ev.mapNum);
  const targetWarps = targetMap ? getWarpEventsForMap(targetMap) : [];
  const targetWarp = targetWarps.find(w => w.index === ev.warpId) || null;

  const fromGroup = fromHeader?.mapGroup;
  const fromNum = fromHeader?.mapNum;
  const reverseWarps = targetWarps.filter(w =>
    fromGroup !== undefined &&
    fromNum !== undefined &&
    w.mapGroup === fromGroup &&
    w.mapNum === fromNum
  );
  const exactReverseWarp = reverseWarps.find(w => w.warpId === ev.index) || null;

  let status = "unknown";
  let statusText = "未能判断";

  if (!targetMap) {
    status = "bad";
    statusText = "目标地图不存在 / gMapGroups 未命中";
  } else if (!targetWarp) {
    status = "warn";
    statusText = `目标地图存在，但没有 index=${ev.warpId} 的目标 warp`;
  } else if (exactReverseWarp) {
    status = "ok";
    statusText = `双向匹配：目标 warp #${exactReverseWarp.index} 会返回当前地图 warp #${ev.index}`;
  } else if (reverseWarps.length) {
    status = "warn";
    statusText = `目标地图有 ${reverseWarps.length} 个 warp 返回当前地图，但 warpId 没有精确指回 #${ev.index}`;
  } else {
    status = "warn";
    statusText = "疑似单向 warp：目标地图没有返回当前地图的 warp";
  }

  return {
    fromMap: fromHeader,
    targetMap,
    targetWarps,
    targetWarp,
    reverseWarps,
    exactReverseWarp,
    status,
    statusText,
  };
}

function selectHeader(header, switchToEventsTab = true, focusEventMatcher = null) {
  if (!header) return false;

  let idx = filteredHeaders.findIndex(h => h.offset === header.offset);
  if (idx < 0) {
    // 当前搜索条件可能过滤掉了目标地图，跳转时自动清空筛选。
    document.getElementById("mapSearch").value = "";
    refreshMapList();
    idx = filteredHeaders.findIndex(h => h.offset === header.offset);
  }

  if (idx < 0) return false;
  selectMap(idx, switchToEventsTab);

  if (focusEventMatcher) {
    const focusEvent = currentEvents.find(focusEventMatcher);
    if (focusEvent) showEventDetail(focusEvent);
  }

  const activeItem = document.querySelector(`.map-option[data-index="${idx}"]`);
  if (activeItem) activeItem.scrollIntoView({ block: "nearest" });
  return true;
}

function jumpToWarpTarget(ev, focusTargetWarp = true) {
  const info = getWarpDestinationInfo(ev);
  if (!info?.targetMap) return false;

  return selectHeader(
    info.targetMap,
    true,
    focusTargetWarp && info.targetWarp ? (targetEv => targetEv.type === "warp" && targetEv.index === info.targetWarp.index) : null
  );
}
