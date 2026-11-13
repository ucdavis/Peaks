/// <reference types="node" />
import { afterEach, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';

const layout = readFileSync('../Views/Shared/_Layout.cshtml', 'utf8');

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

it('names the actual mobile navigation button using its visible Menu label', () => {
  const toggle = layout.match(/<button\b[^>]*data-navigation-toggle[\s\S]*?<\/button>/)?.[0];
  expect(toggle).toBeTruthy();
  document.body.innerHTML = toggle;
  const button = screen.getByRole('button', { name: 'Menu' });
  expect(button).toHaveTextContent('Menu');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveAttribute('aria-controls', 'navbarText');
});
