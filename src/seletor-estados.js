// Melhoria progressiva do select: a seleção só muda quando a opção é confirmada.
export function enhanceStateSelect(select, onSelect) {
  const host = select.parentElement;
  const label = host.querySelector('label');
  label.id = 'state-control-label';
  const options = [...select.options].filter(option => option.value);
  const control = document.createElement('button');
  control.type = 'button';
  control.id = 'state-combobox';
  control.className = 'state-combobox';
  control.dataset.placeholder = select.options[0].textContent;
  control.setAttribute('role', 'combobox');
  control.setAttribute('aria-labelledby', label.id);
  control.setAttribute('aria-haspopup', 'listbox');
  control.setAttribute('aria-expanded', 'false');
  control.setAttribute('aria-controls', 'state-options');
  const value = document.createElement('span');
  const arrow = document.createElement('span');
  arrow.className = 'state-combobox__arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '⌄';
  control.append(value, arrow);
  const list = document.createElement('ul');
  list.id = 'state-options';
  list.className = 'state-options';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-labelledby', label.id);
  list.hidden = true;
  const items = options.map(option => {
    const item = document.createElement('li');
    item.id = `state-option-${option.value}`;
    item.dataset.value = option.value;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');
    item.textContent = option.textContent;
    list.append(item);
    return item;
  });
  let active = 0;
  let query = '';
  let typedAt = 0;
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function position() {
    if (list.hidden) return;
    const bounds = control.getBoundingClientRect();
    const below = innerHeight - bounds.bottom - 12;
    const above = bounds.top - 12;
    const desired = Math.min(20 * parseFloat(getComputedStyle(document.documentElement).fontSize), innerHeight * .5);
    const opensAbove = below < desired && above > below;
    list.style.left = `${bounds.left}px`;
    list.style.width = `${bounds.width}px`;
    list.style.setProperty('--list-space', `${Math.max(0, opensAbove ? above : below)}px`);
    list.style.top = opensAbove ? 'auto' : `${bounds.bottom + 4}px`;
    list.style.bottom = opensAbove ? `${innerHeight - bounds.top + 4}px` : 'auto';
  }

  function highlight(index) {
    active = (index + items.length) % items.length;
    items.forEach((item, i) => item.toggleAttribute('data-active', i === active));
    control.setAttribute('aria-activedescendant', items[active].id);
    // Rolar somente a lista, preservando a posição da página e do foco.
    const item = items[active];
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }

  function close() {
    list.hidden = true;
    control.setAttribute('aria-expanded', 'false');
    control.removeAttribute('aria-activedescendant');
    query = '';
  }

  function open() {
    if (!list.hidden) return;
    list.hidden = false;
    control.setAttribute('aria-expanded', 'true');
    position();
    highlight(Math.max(0, options.findIndex(option => option.value === select.value)));
  }

  function sync(uf) {
    value.textContent = options.find(option => option.value === uf)?.textContent || select.options[0].textContent;
    items.forEach(item => item.setAttribute('aria-selected', String(item.dataset.value === uf)));
  }

  function confirm(index) {
    close();
    onSelect(options[index].value);
  }

  control.addEventListener('click', () => list.hidden ? open() : close());
  control.addEventListener('keydown', event => {
    const key = event.key;
    if (key === 'Tab') { close(); return; }
    if (key === 'Escape') {
      if (!list.hidden) { event.preventDefault(); event.stopPropagation(); close(); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(key)) {
      event.preventDefault();
      const wasClosed = list.hidden;
      open();
      if (key === 'Home') highlight(0);
      else if (key === 'End') highlight(items.length - 1);
      else if (!wasClosed && key === 'ArrowDown') highlight(active + 1);
      else if (!wasClosed && key === 'ArrowUp') highlight(active - 1);
      else if (wasClosed && key === 'ArrowUp' && !select.value) highlight(items.length - 1);
      else if (!wasClosed && ['Enter', ' '].includes(key)) confirm(active);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      open();
      const now = performance.now();
      query = now - typedAt > 800 ? key : query + key;
      typedAt = now;
      const repeated = query.length > 1 && [...normalize(query)].every(letter => letter === normalize(key));
      const indexes = options.map((_, index) => repeated ? (active + 1 + index) % options.length : index);
      const match = indexes.find(index => normalize(options[index].textContent).startsWith(normalize(repeated ? key : query))) ?? -1;
      if (match >= 0) highlight(match);
    }
  });
  list.addEventListener('pointerdown', event => event.preventDefault());
  list.addEventListener('click', event => {
    const item = event.target.closest('[role="option"]');
    if (item) confirm(items.indexOf(item));
  });
  document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(); });
  control.addEventListener('blur', close);
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
  host.append(control, list);
  sync(select.value);
  label.htmlFor = control.id;
  select.hidden = true;
  return sync;
}
