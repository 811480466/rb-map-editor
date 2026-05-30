// ============================================================
// Terrain collision editor panel
// ============================================================

(function terrainCollisionPanel() {
  function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'terrainCollisionPanel';
    panel.className = 'terrain-collision-panel';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '12px';

    // Transparency slider & current height/collision
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.alignItems = 'center';
    topRow.style.gap = '16px';

    const transparencyLabel = document.createElement('label');
    transparencyLabel.textContent = '透明度';
    const transparencyInput = document.createElement('input');
    transparencyInput.type = 'range';
    transparencyInput.min = 0;
    transparencyInput.max = 3;
    transparencyInput.value = 3;
    transparencyInput.disabled = true; // 只显示，不可编辑

    const heightDisplay = document.createElement('span');
    heightDisplay.id = 'currentHeightDisplay';
    heightDisplay.textContent = '高度: 0';

    const collisionDisplay = document.createElement('span');
    collisionDisplay.id = 'currentCollisionDisplay';
    collisionDisplay.textContent = '碰撞: 0';

    topRow.appendChild(transparencyLabel);
    topRow.appendChild(transparencyInput);
    topRow.appendChild(heightDisplay);
    topRow.appendChild(collisionDisplay);

    panel.appendChild(topRow);

    // Collision tiles grid
    const grid = document.createElement('div');
    grid.id = 'collisionTileGrid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '8px';

    // Example 8 tiles, left white = passable, right red = blocked
    for (let i = 0; i < 8; i++) {
      const tile = document.createElement('div');
      tile.className = 'collision-tile';
      tile.textContent = i;
      tile.style.padding = '12px';
      tile.style.textAlign = 'center';
      tile.style.borderRadius = '4px';
      tile.style.cursor = 'pointer';
      tile.style.backgroundColor = i % 2 === 0 ? '#fff' : '#f44336';
      tile.style.color = i % 2 === 0 ? '#000' : '#fff';

      tile.addEventListener('click', () => {
        document.getElementById('currentHeightDisplay').textContent = '高度: ' + i;
        document.getElementById('currentCollisionDisplay').textContent = '碰撞: ' + (i % 2);
      });

      grid.appendChild(tile);
    }

    panel.appendChild(grid);

    return panel;
  }

  // Add to the right side panel
  const rightPanel = document.querySelector('.panel.right');
  if (rightPanel) {
    const existing = document.getElementById('terrainCollisionPanel');
    if (!existing) rightPanel.appendChild(createPanel());
  }
})();