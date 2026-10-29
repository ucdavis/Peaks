import { describe, expect, it, vi } from 'vitest';

describe('shared layout without Bootstrap JavaScript', () => {
  it('toggles the mobile menu and dismisses messages', async () => {
    document.body.innerHTML = `
      <div data-site-navigation><button data-navigation-toggle aria-controls="navbarText" aria-expanded="false">Menu</button>
      <nav id="navbarText" class="hidden lg:block"><details data-navigation-dropdown><summary>Admin</summary><a href="/admin">Admin Home</a></details>
      <details data-navigation-dropdown><summary>Team</summary></details></nav></div>
      <div class="alert"><button data-dismiss-message>Dismiss</button>Message</div>
    `;
    vi.resetModules();
    await import('./navigation');
    const toggle = document.querySelector<HTMLButtonElement>('[data-navigation-toggle]');
    const navigation = document.getElementById('navbarText');

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.classList.contains('hidden')).toBe(false);
    expect(navigation.classList.contains('lg:block')).toBe(true);

    const dropdown = document.querySelector<HTMLDetailsElement>('[data-navigation-dropdown]');
    dropdown.open = true;
    dropdown.querySelector('summary').focus();
    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dropdown.open).toBe(false);
    expect(document.activeElement).toBe(dropdown.querySelector('summary'));

    dropdown.open = true;
    document.body.click();
    expect(dropdown.open).toBe(false);

    dropdown.open = true;
    const otherDropdown = document.querySelectorAll<HTMLDetailsElement>('[data-navigation-dropdown]')[1];
    otherDropdown.open = true;
    otherDropdown.dispatchEvent(new Event('toggle'));
    expect(dropdown.open).toBe(false);
    expect(otherDropdown.open).toBe(true);

    toggle.click();
    expect(otherDropdown.open).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(navigation.classList.contains('hidden')).toBe(true);

    document.querySelector<HTMLButtonElement>('[data-dismiss-message]').click();
    expect(document.querySelector('.alert')).toBeNull();
    document.body.innerHTML = '';
  });
});
