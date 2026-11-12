import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

it('reports a cleared optional date as valid after closing the calendar', () => {
  const onValidityChange = vi.fn();
  const Field = () => {
    const [date, setDate] = React.useState(new Date(2026, 10, 6));
    return <form>
      <AssignDate date={date} isRequired={false} onChangeDate={setDate} onValidityChange={onValidityChange} />
    </form>;
  };
  const { container } = render(<Field />);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  for (const name of ['Month', 'Day', 'Year']) {
    fireEvent.change(screen.getByRole('spinbutton', { name }), { target: { value: '' } });
  }
  expect(screen.getByRole('spinbutton', { name: 'Month' })).toBeRequired();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(screen.getByRole('spinbutton', { name: 'Month' })).not.toBeRequired();
  expect(container.querySelector('form').checkValidity()).toBe(true);
  expect(onValidityChange).toHaveBeenLastCalledWith(true);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each(['complete', 'partial'])('clears an optional %s date without submitting the form', state => {
  const onChangeDate = vi.fn();
  const onValidityChange = vi.fn();
  const onSubmit = vi.fn(event => event.preventDefault());
  const Field = () => {
    const [date, setDate] = React.useState(state === 'complete' ? new Date(2026, 10, 6) : null);
    return <form onSubmit={onSubmit}>
      <AssignDate date={date} isRequired={false} onChangeDate={value => {
        setDate(value);
        onChangeDate(value);
      }} onValidityChange={onValidityChange} />
    </form>;
  };
  const { container } = render(<Field />);
  if (state === 'partial') {
    userEvent.type(screen.getByRole('spinbutton', { name: 'Month' }), '11');
    expect(container.querySelector('form').checkValidity()).toBe(false);
  }

  userEvent.click(screen.getByRole('button', { name: 'Clear date' }));

  for (const name of ['Month', 'Day', 'Year']) {
    expect(screen.getByRole('spinbutton', { name })).toHaveValue(null);
  }
  expect(onChangeDate).toHaveBeenLastCalledWith(null);
  expect(onValidityChange).toHaveBeenLastCalledWith(true);
  expect(container.querySelector('form').checkValidity()).toBe(true);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

it.each([false, true])('requires an explicit Today opt-in when isRequired is %s', isRequired => {
  render(<AssignDate date={new Date(2026, 10, 6)} isRequired={isRequired} onChangeDate={vi.fn()} />);
  expect(screen.queryByRole('button', { name: 'Clear date' }) !== null).toBe(!isRequired);
  userEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
});

it.each([false, true])('selects local midnight with Today and closes the calendar when isRequired is %s', isRequired => {
  vi.useFakeTimers({ toFake: ['Date'] });
  try {
    vi.setSystemTime(new Date(2026, 10, 12, 15, 42, 31));
    const onChangeDate = vi.fn();
    const onValidityChange = vi.fn();
    const onSubmit = vi.fn(event => event.preventDefault());
    const Field = () => {
      const [date, setDate] = React.useState<Date>(null);
      return <form onSubmit={onSubmit}>
        <AssignDate date={date} isRequired={isRequired} showToday onChangeDate={value => {
          setDate(value);
          onChangeDate(value);
        }} onValidityChange={onValidityChange} />
      </form>;
    };
    const { container } = render(<Field />);
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
    userEvent.type(screen.getByRole('spinbutton', { name: 'Month' }), '11');
    expect(container.querySelector('form').checkValidity()).toBe(false);

    userEvent.click(screen.getByRole('button', { name: 'Today' }));

    expect(onChangeDate).toHaveBeenLastCalledWith(new Date(2026, 10, 12));
    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveValue(11);
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveValue(12);
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveValue(2026);
    expect(screen.getByRole('button', { name: 'Toggle calendar' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
    expect(container.querySelector('form').checkValidity()).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

it('does not offer Clear or Today for a disabled date', () => {
  render(<AssignDate date={new Date(2026, 10, 6)} isRequired={false} disabled showToday onChangeDate={vi.fn()} />);
  expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
});

it('allows keyboard activation of Today to restore an unfinished edit of today', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  try {
    vi.setSystemTime(new Date(2026, 10, 12, 15));
    const Field = () => {
      const [date, setDate] = React.useState(new Date(2026, 10, 12));
      return <form><AssignDate date={date} isRequired showToday onChangeDate={setDate} /></form>;
    };
    const { container } = render(<Field />);
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    userEvent.click(year);
    fireEvent.change(year, { target: { value: '202' } });
    expect(container.querySelector('form').checkValidity()).toBe(false);

    const today = screen.getByRole('button', { name: 'Today' });
    act(() => today.focus());
    expect(today).toHaveFocus();
    userEvent.keyboard('{Enter}');

    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveValue(2026);
    expect(container.querySelector('form').checkValidity()).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle calendar' })).toHaveAttribute('aria-expanded', 'false');
  } finally {
    vi.useRealTimers();
  }
});

it('revalidates a restored date after clearing its day and clicking outside', () => {
  const onValidityChange = vi.fn();
  const { container } = render(<form>
    <AssignDate date={new Date(2026, 10, 6)} isRequired={false} onChangeDate={vi.fn()} onValidityChange={onValidityChange} />
    <button type='button'>Outside</button>
  </form>);
  const day = screen.getByRole('spinbutton', { name: 'Day' });
  userEvent.click(day);
  userEvent.type(day, '{backspace}', { skipClick: true });
  expect(onValidityChange).toHaveBeenLastCalledWith(false);
  expect(container.querySelector('form').checkValidity()).toBe(false);

  userEvent.click(screen.getByRole('button', { name: 'Outside' }));

  expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveValue(6);
  expect(onValidityChange).toHaveBeenLastCalledWith(true);
  expect(container.querySelector('form').checkValidity()).toBe(true);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

it('repositions the calendar when its modal scrolls without using page scroll offsets', () => {
  let top = 600;
  const rect = (y: number, height: number) => ({
    top: y, bottom: y + height, left: 20, right: 340,
    width: 320, height, x: 20, y, toJSON: () => ({})
  });
  const { container } = render(
    <div className='modal'>
      <AssignDate date={new Date(2026, 9, 22)} isRequired={false} onChangeDate={vi.fn()} />
    </div>
  );
  const modal = container.querySelector('.modal');
  const anchor = container.querySelector('.peaks-date-picker');
  const host = container.querySelector<HTMLElement>('.peaks-calendar-host');
  vi.spyOn(modal, 'getBoundingClientRect').mockImplementation(() => rect(0, 768));
  vi.spyOn(anchor, 'getBoundingClientRect').mockImplementation(() => rect(top, 40));
  vi.spyOn(host, 'scrollHeight', 'get').mockReturnValue(300);
  vi.spyOn(host, 'offsetWidth', 'get').mockReturnValue(320);

  fireEvent.click(screen.getByRole('button', { name: 'Toggle calendar' }));
  expect(host.style.top).toBe('-308px');
  expect(host).toContainElement(container.querySelector('.react-calendar'));

  top = 100;
  fireEvent.scroll(modal);
  expect(host.style.top).toBe('48px');
});
