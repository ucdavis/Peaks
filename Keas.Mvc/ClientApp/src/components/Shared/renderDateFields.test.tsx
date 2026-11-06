import { act, fireEvent, screen } from '@testing-library/react';
import { renderDateFields } from './renderDateFields';

it('submits shared picker edits using the original MVC field name and date format', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  document.body.innerHTML = '<form><div data-date-field data-label="Start date"><input name="StartDate" type="date" value="2026-10-22" /></div></form>';
  act(() => renderDateFields());
  expect(document.querySelector('input[type="date"]:not([hidden])')).toBeNull();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Month' }), { target: { value: '11' } });
  expect(new FormData(document.querySelector('form')).get('StartDate')).toBe('2026-11-22');
});

it('rejects partial dates instead of submitting an empty MVC date', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  document.body.innerHTML = '<form><div data-date-field data-label="Start date"><input name="StartDate" type="date" /></div></form>';
  act(() => renderDateFields());
  const form = document.querySelector('form');
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Month' }), { target: { value: '11' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Year' }), { target: { value: '2026' } });
  expect(form.checkValidity()).toBe(false);
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a complete date');
  expect(new FormData(form).get('StartDate')).toBe('incomplete-date');

  fireEvent.change(screen.getByRole('spinbutton', { name: 'Day' }), { target: { value: '6' } });
  expect(form.checkValidity()).toBe(true);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(new FormData(form).get('StartDate')).toBe('2026-11-06');

  for (const name of ['Month', 'Day', 'Year']) {
    fireEvent.change(screen.getByRole('spinbutton', { name }), { target: { value: '' } });
  }
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get('StartDate')).toBe('');
});
