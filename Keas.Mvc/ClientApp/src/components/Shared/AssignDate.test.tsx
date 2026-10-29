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

it('keeps calendar navigation names accurate as the view changes', () => {
  const props = {
    date: new Date(2026, 9, 22),
    isRequired: false,
    onChangeDate: vi.fn()
  };
  const { rerender } = render(<AssignDate {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));

  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('button', { name: 'September 2026' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
  expect(screen.getByRole('button', { name: 'October 2025' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Next year' }));

  fireEvent.click(screen.getByRole('button', { name: 'October 2026' }));
  expect(screen.getByRole('button', { name: 'Previous year' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next year' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Next decade' }));
  expect(screen.getByRole('button', { name: '2036' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Previous decade' }));

  fireEvent.click(screen.getByRole('button', { name: '2026' }));
  expect(screen.getByRole('button', { name: 'Previous decade' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next decade' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Previous century' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next century' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /2021.*2030/ }));
  expect(screen.getAllByRole('button', { name: 'Previous century' })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Next century' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Next decade' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(screen.getByRole('button', { name: 'Next century' })).toBeVisible();
  expect(props.onChangeDate).not.toHaveBeenCalled();

  rerender(<AssignDate {...props} disabled />);
  rerender(<AssignDate {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(screen.getByRole('button', { name: 'Next month' })).toBeVisible();
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
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('definition')).toHaveTextContent('10/22/2026');
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  rerender(
    <AssignDate
      date={null}
      disabled
      isRequired={false}
      onChangeDate={vi.fn()}
    />
  );
  expect(screen.getByRole('definition')).toHaveTextContent('—');
});
