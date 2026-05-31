// ============================================================
// Editable Wild Pokémon Panel
// ============================================================
// 支持：最低等级/最高等级/宝可梦选择(可搜索下拉)/几率

(function wildPanelEditableModule() {
  const RAND_LAND = [20,10,10,10,10,10,10,5,5,5,4,1];
  const RAND_FINISH = [20,20,10,10,10,10,10,5,4,1];
  const RAND_SUF = [30,30,20,10,10];
  const RAND_ROCK = [60,30,5,4,1];

  function getPokemonMap() {
    return new Map(window.RBEditorPokemonData.map(p=>[Number(p.id),p]));
  }

  function createPokemonDropdown(selectedId){
    const map = getPokemonMap();
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '搜索宝可梦';

    const list = document.createElement('div');
    list.className = 'wild-pokemon-dropdown';
    list.style.maxHeight = '200px';
    list.style.overflow = 'auto';
    list.style.border = '1px solid #ccc';
    list.style.display = 'none';
    list.style.position = 'absolute';
    list.style.background = '#fff';
    list.style.zIndex = '100';

    function refreshList(filter=''){ 
      list.innerHTML='';
      Array.from(map.values()).filter(p=>p.name.includes(filter)||p.code.includes(filter)).forEach(p=>{
        const item = document.createElement('div');
        item.textContent = `${p.name} #${p.id}`;
        item.style.padding='2px 4px';
        item.style.cursor='pointer';
        item.onclick=()=>{
          input.value=p.name;
          input.dataset.speciesId=p.id;
          list.style.display='none';
        };
        list.appendChild(item);
      });
    }

    input.addEventListener('input',(e)=>{ refreshList(e.target.value); list.style.display='block'; });
    input.dataset.speciesId = selectedId;
    input.onclick=()=>{ refreshList(input.value); list.style.display='block'; };

    const container = document.createElement('div');
    container.style.position='relative';
    container.appendChild(input);
    container.appendChild(list);
    return container;
  }

  function createLevelInput(value){
    const inp = document.createElement('input');
    inp.type='number';
    inp.min='1';
    inp.max='100';
    inp.value=value||1;
    inp.style.width='50px';
    return inp;
  }

  function renderEditableEntry(entry){
    const row = document.createElement('div');
    row.className='wild-entry-row';
    row.style.display='flex';
    row.style.gap='8px';

    const minLevel = createLevelInput(entry.minLevel);
    const maxLevel = createLevelInput(entry.maxLevel);
    const pokeDropdown = createPokemonDropdown(entry.species);

    row.appendChild(minLevel);
    row.appendChild(maxLevel);
    row.appendChild(pokeDropdown);

    return row;
  }

  function renderEditableTable(group){
    const container = document.createElement('div');
    container.className='wild-edit-table';
    container.style.display='flex';
    container.style.flexDirection='column';
    container.style.gap='4px';

    if(!group||!group.entries||!group.entries.length){
      container.innerHTML='<div>当前地图没有数据</div>';
      return container;
    }

    group.entries.forEach(entry=>{
      container.appendChild(renderEditableEntry(entry));
    });

    return container;
  }

  window.RBEditorWildPanelEditable = {
    RAND_LAND,RAND_FINISH,RAND_SUF,RAND_ROCK,
    renderEditableTable
  };
})();