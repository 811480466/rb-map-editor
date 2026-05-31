(function(){
  const TRAINER_TYPES = [
    {value:0, label:'无训练家类型'},
    {value:1, label:'普通训练家'},
    {value:2, label:'可观察所有方向'},
    {value:3, label:'埋地训练家'}
  ];

  function createDropdown(containerId, eventField) {
    const container = document.getElementById(containerId);
    if(!container) return;

    const select = document.createElement('select');
    select.id = `trainerTypeSelect`;
    select.dataset.eventField = eventField;

    for(const t of TRAINER_TYPES){
      const opt = document.createElement('option');
      opt.value = t.value;
      opt.textContent = t.label;
      select.appendChild(opt);
    }

    container.appendChild(select);
    return select;
  }

  window.RBEditorTrainerTypeSelect = {
    createDropdown,
    TRAINER_TYPES
  };
})();