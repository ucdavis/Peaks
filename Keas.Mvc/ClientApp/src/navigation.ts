const navigation = document.querySelector<HTMLElement>('[data-site-navigation]');
const toggle = navigation?.querySelector<HTMLButtonElement>('[data-navigation-toggle]');
const menu = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
const dropdowns = navigation?.querySelectorAll<HTMLDetailsElement>('[data-navigation-dropdown]');

function closeDropdowns(except?: HTMLDetailsElement) {
  dropdowns?.forEach(dropdown => {
    if (dropdown !== except) dropdown.open = false;
  });
}

function setMenuExpanded(expanded: boolean) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(expanded));
  menu.classList.toggle('hidden', !expanded);
  if (!expanded) closeDropdowns();
}

toggle?.addEventListener('click', () => {
  setMenuExpanded(toggle.getAttribute('aria-expanded') !== 'true');
});

dropdowns?.forEach(dropdown => dropdown.addEventListener('toggle', () => {
  if (dropdown.open) closeDropdowns(dropdown);
}));

navigation?.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openDropdown = navigation.querySelector<HTMLDetailsElement>('[data-navigation-dropdown][open]');
  if (openDropdown) {
    openDropdown.open = false;
    openDropdown.querySelector('summary')?.focus();
  } else if (toggle?.getAttribute('aria-expanded') === 'true') {
    setMenuExpanded(false);
    toggle.focus();
  }
});

navigation?.addEventListener('click', event => {
  if ((event.target as Element).closest('a[href]')) setMenuExpanded(false);
});

if (navigation) {
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target as Node)) closeDropdowns();
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-dismiss-message]')
  .forEach(button => button.addEventListener('click', () => {
    button.closest('.alert')?.remove();
  }));

export {};
