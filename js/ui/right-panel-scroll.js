(function(){
  function apply(){
    if(document.getElementById('rightPanelScrollStyle')) return;
    const s=document.createElement('style');
    s.id='rightPanelScrollStyle';
    s.textContent='.panel.right{height:100vh!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}.panel.right>h2{flex:0 0 auto!important}.panel.right #eventTab,.panel.right #mapInfoTab,.panel.right #mapConnectorPanel,.panel.right #terrainEditorPanel{flex:1 1 auto!important;min-height:0!important}.panel.right #eventTab.active,.panel.right #mapInfoTab.active,.panel.right #mapConnectorPanel.active{overflow:auto!important}.panel.right .tile-library-wrap,.panel.right .collision-editor-body{overflow:auto!important}';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();
