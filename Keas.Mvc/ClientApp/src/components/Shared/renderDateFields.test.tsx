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
