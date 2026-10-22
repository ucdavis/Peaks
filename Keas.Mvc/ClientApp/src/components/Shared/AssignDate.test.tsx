import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssignDate from './AssignDate';

// jsdom has no canvas; input sizing has a supported no-context fallback.
beforeEach(() =>
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
);

it('preserves month/day/year entry and emits a local date', () => {
  const onChangeDate = vi.fn();
  render(
    <AssignDate
      date={new Date(2026, 9, 22)}
      isRequired
      onChangeDate={onChangeDate}
    />
  );
  const month = screen.getByRole('spinbutton', { name: 'Month' });
  expect(month).toHaveValue(10);
  expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveValue(22);
  expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveValue(2026);
  expect(month).toBeRequired();
  fireEvent.change(month, { target: { value: '11' } });
  expect(onChangeDate).toHaveBeenLastCalledWith(new Date(2026, 10, 22));
});

it('allows an optional date to be cleared through keyboard entry', () => {
  const onChangeDate = vi.fn();
  render(
    <AssignDate
      date={new Date(2026, 9, 22)}
      isRequired={false}
      onChangeDate={onChangeDate}
    />
  );
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Month' }), {
    target: { value: '' }
  });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Day' }), {
    target: { value: '' }
  });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Year' }), {
    target: { value: '' }
  });
  expect(onChangeDate).toHaveBeenLastCalledWith(null);
});

it('shows validation and opens and closes its calendar', () => {
  render(
    <AssignDate
      date={null}
      isRequired
      onChangeDate={vi.fn()}
      error={{ path: 'date', message: 'Date is required' }}
    />
  );
  expect(screen.getByText('Date is required')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(document.querySelector('.react-calendar')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(
    screen.getByRole('button', { name: 'Toggle calendar' })
  ).toHaveAttribute('aria-expanded', 'false');
});

it('renders disabled expiration values without an editable picker', () => {
  const { rerender } = render(
    <AssignDate
      date={new Date(2026, 9, 22)}
      disabled
      isRequired={false}
      onChangeDate={vi.fn()}
    />
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
  expect(screen.getByRole('textbox')).not.toHaveValue('');
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  rerender(
    <AssignDate
      date={null}
      disabled
      isRequired={false}
      onChangeDate={vi.fn()}
    />
  );
  expect(screen.getByRole('textbox')).toHaveValue('');
});
