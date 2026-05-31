// ============================================================
// Ensure movementType select loads for object event panel
// ============================================================
(function(){
  function loadMovementTypeSelect(){
    if(window.RBEditorMovementTypeSelect){
      window.RBEditorMovementTypeSelect.enhanceMovementTypeSelect();
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', loadMovementTypeSelect);
  }else{
    loadMovementTypeSelect();
  }
})();