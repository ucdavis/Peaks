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

it('does not submit an old date when a complete entry is invalid or has a short year', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  document.body.innerHTML = '<form><div data-date-field><input name="StartDate" type="date" value="2026-01-31" /></div></form>';
  act(() => renderDateFields());
  const form = document.querySelector('form');
  const month = screen.getByRole('spinbutton', { name: 'Month' });
  const day = screen.getByRole('spinbutton', { name: 'Day' });
  const year = screen.getByRole('spinbutton', { name: 'Year' });

  fireEvent.change(month, { target: { value: '2' } });
  expect(form.checkValidity()).toBe(false);
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid date');
  expect(new FormData(form).get('StartDate')).not.toBe('2026-01-31');

  fireEvent.change(day, { target: { value: '28' } });
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get('StartDate')).toBe('2026-02-28');

  fireEvent.change(year, { target: { value: '20' } });
  expect(form.checkValidity()).toBe(false);
  expect(new FormData(form).get('StartDate')).toBe('incomplete-date');
  fireEvent.change(year, { target: { value: '2028' } });
  fireEvent.change(day, { target: { value: '29' } });
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get('StartDate')).toBe('2028-02-29');
  fireEvent.change(year, { target: { value: '10000' } });
  expect(form.checkValidity()).toBe(false);
  expect(new FormData(form).get('StartDate')).toBe('incomplete-date');
  fireEvent.change(year, { target: { value: '2028' } });
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get('StartDate')).toBe('2028-02-29');
});

it.each(['', '2026-10-22'])('rejects 11/06/202 when the initial date is "%s"', initialDate => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  document.body.innerHTML = `<form><div data-date-field><input name="StartDate" type="date" value="${initialDate}" /></div></form>`;
  act(() => renderDateFields());
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Month' }), { target: { value: '11' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Day' }), { target: { value: '6' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Year' }), { target: { value: '202' } });
  const form = document.querySelector('form');
  expect(form.checkValidity()).toBe(false);
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a complete date');
  expect(new FormData(form).get('StartDate')).toBe('incomplete-date');
});

it('submits a calendar selection from an empty optional date and allows it to be cleared', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  try {
    vi.setSystemTime(new Date(2026, 10, 6));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    document.body.innerHTML = '<form><div data-date-field><input name="StartDate" type="date" /></div></form>';
    act(() => renderDateFields());
    const form = document.querySelector('form');
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get('StartDate')).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /November 6, 2026/ }));
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get('StartDate')).toBe('2026-11-06');
    for (const name of ['Year', 'Day', 'Month']) {
      fireEvent.change(screen.getByRole('spinbutton', { name }), { target: { value: '' } });
    }
    expect(form.checkValidity()).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(new FormData(form).get('StartDate')).toBe('');
  } finally {
    vi.useRealTimers();
  }
});

it('can correct a partial entry with a calendar selection', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  document.body.innerHTML = '<form><div data-date-field><input name="StartDate" type="date" value="2026-11-06" /></div></form>';
  act(() => renderDateFields());
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Day' }), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  fireEvent.click(screen.getByRole('button', { name: /November 12, 2026/ }));
  const form = document.querySelector('form');
  expect(form.checkValidity()).toBe(true);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(new FormData(form).get('StartDate')).toBe('2026-11-12');
});

it('ignores disabled changes without discarding their unfinished edits', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  document.body.innerHTML = '<form><fieldset id="change"><div data-date-field><input name="StartDate" type="date" /></div></fieldset></form>';
  act(() => renderDateFields());
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Month' }), { target: { value: '11' } });
  const form = document.querySelector('form');
  const change = document.querySelector<HTMLFieldSetElement>('#change');
  expect(form.checkValidity()).toBe(false);
  change.disabled = true;
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).has('StartDate')).toBe(false);
  change.disabled = false;
  expect(form.checkValidity()).toBe(false);
  expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveValue(11);
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
