(function(){
  let showMovementRange = false;

  function toggleMovementRange() {
    showMovementRange = !showMovementRange;
    const btn = document.getElementById('toggleMovementRangeBtn');
    if(btn){
      btn.classList.toggle('active', showMovementRange);
      btn.textContent = showMovementRange ? '移动范围:开' : '移动范围:关';
    }
    if(typeof currentEvents !== 'undefined' && typeof renderMap === 'function' && currentMap){
      renderMap(currentMap, currentEvents);
    }
  }

  function drawObjectMovementRange(ev, px, py, cs) {
    if(!showMovementRange) return;
    if(ev.type !== 'object') return;
    const rangeX = Number(ev.movementRangeX)||0;
    const rangeY = Number(ev.movementRangeY)||0;
    if(rangeX<=0 && rangeY<=0) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.62)';
    ctx.lineWidth = Math.max(1, Math.floor(cs*0.06));
    ctx.strokeRect(
      px-rangeX*cs, py-rangeY*cs,
      cs+rangeX*cs*2, cs+rangeY*cs*2
    );
    ctx.restore();
  }

  window.RBEditorEventToolbarShowRange = {
    toggleMovementRange,
    get showMovementRange(){return showMovementRange;},
    drawObjectMovementRange
  };
})();