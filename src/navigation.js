const header = document.querySelector('.site-header');
const toggle = header.querySelector('.menu-toggle');
const navigation = header.querySelector('.site-nav');
const desktop = window.matchMedia('(min-width: 960px)');

function updateToggle(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

// Popover nativo mantém botão, Esc e clique fora operáveis mesmo sem este script.
navigation.addEventListener('beforetoggle', event => updateToggle(event.newState === 'open'));

header.addEventListener('focusout', (event) => {
  if (!header.contains(event.relatedTarget) && navigation.matches(':popover-open')) navigation.hidePopover();
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a') && navigation.matches(':popover-open')) navigation.hidePopover();
});

desktop.addEventListener('change', () => {
  const focusedElement = document.activeElement;
  const navigationHadFocus = navigation.contains(focusedElement);
  if (navigation.matches(':popover-open')) navigation.hidePopover();
  if (!desktop.matches && navigationHadFocus) toggle.focus();
  if (desktop.matches && focusedElement === toggle) navigation.querySelector('a').focus();
});

updateToggle(navigation.matches(':popover-open'));
