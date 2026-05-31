/*
通用可搜索下拉组件
可以用于对象图形、宝可梦、训练家类型等

用法:
const combo = new SearchableDropdown({
  container: document.querySelector('#container'),
  value: 656,
  options: RBEditorPokemonData,
  display: item => `#${item.id} ${item.name} / ${item.macro}`,
  onChange: value => { input.value = value; }
});
*/

export class SearchableDropdown {
  constructor({ container, value, options, display, onChange }) {
    this.container = container;
    this.value = value;
    this.options = options || [];
    this.display = display || (i => i.name);
    this.onChange = onChange || (()=>{});
    this.open = false;

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'searchable-dropdown';

    this.hidden = document.createElement('input');
    this.hidden.type = 'hidden';
    this.hidden.value = this.value;

    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'dropdown-trigger';
    this.trigger.innerHTML = `<span class='dropdown-text'></span><span class='dropdown-arrow'>▼</span>`;

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'dropdown-list';
    this.dropdown.style.display = 'none';

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'dropdown-search';
    this.searchInput.placeholder = '搜索...';

    this.optionsContainer = document.createElement('div');
    this.optionsContainer.className = 'dropdown-options';

    this.dropdown.appendChild(this.searchInput);
    this.dropdown.appendChild(this.optionsContainer);

    this.wrapper.appendChild(this.hidden);
    this.wrapper.appendChild(this.trigger);
    this.wrapper.appendChild(this.dropdown);

    this.container.appendChild(this.wrapper);

    this.updateTrigger();
    this.renderOptions();

    this.trigger.addEventListener('click', e => {
      e.preventDefault();
      this.toggleDropdown();
    });

    this.searchInput.addEventListener('input', () => this.renderOptions(this.searchInput.value));

    document.addEventListener('click', e => {
      if (!this.wrapper.contains(e.target)) this.closeDropdown();
    });
  }

  updateTrigger() {
    const text = this.trigger.querySelector('.dropdown-text');
    const current = this.options.find(o => o.id == this.value);
    text.textContent = current ? this.display(current) : '未选择';
  }

  renderOptions(query = '') {
    this.optionsContainer.innerHTML = '';
    const q = query.trim().toLowerCase();
    const filtered = this.options.filter(o => !q || this.display(o).toLowerCase().includes(q));
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'dropdown-empty';
      empty.textContent = '无匹配项';
      this.optionsContainer.appendChild(empty);
      return;
    }
    filtered.forEach(item => {
      const opt = document.createElement('label');
      opt.className = 'dropdown-option';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'dropdown-option';
      radio.checked = item.id == this.value;
      const span = document.createElement('span');
      span.className = 'option-text';
      span.textContent = this.display(item);
      opt.appendChild(radio);
      opt.appendChild(span);
      opt.addEventListener('click', e => {
        e.preventDefault();
        this.value = item.id;
        this.hidden.value = item.id;
        this.updateTrigger();
        this.onChange(item.id);
        this.closeDropdown();
      });
      this.optionsContainer.appendChild(opt);
    });
  }

  toggleDropdown() {
    this.open = !this.open;
    this.dropdown.style.display = this.open ? 'block' : 'none';
    if (this.open) this.searchInput.focus();
  }

  closeDropdown() {
    this.open = false;
    this.dropdown.style.display = 'none';
  }
}