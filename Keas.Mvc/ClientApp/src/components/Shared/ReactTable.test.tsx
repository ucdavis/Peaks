import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ReactTable } from './ReactTable';

it('preserves sorting, filtering, pagination and page size under the React 18 root', () => {
  const data = Array.from({ length: 25 }, (_, i) => ({
    name: `Person ${String(i + 1).padStart(2, '0')}`
  }));
  const columns = [{ header: 'Name', accessorKey: 'name' }];
  const { container } = render(
    <ReactTable
      columns={columns}
      data={data}
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
    />
  );
  const rows = () =>
    within(container.querySelector('tbody')).getAllByRole('row');
  expect(rows()).toHaveLength(10);
  expect(rows()[0]).toHaveTextContent('Person 01');
  fireEvent.click(screen.getByLabelText('Next'));
  expect(rows()[0]).toHaveTextContent('Person 11');
  fireEvent.click(screen.getByLabelText('Previous'));
  fireEvent.click(screen.getByText('Name'));
  fireEvent.click(screen.getByText('Name'));
  expect(rows()[0]).toHaveTextContent('Person 25');
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Person 02' }
  });
  expect(rows()).toHaveLength(1);
  expect(rows()[0]).toHaveTextContent('Person 02');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
  expect(rows()).toHaveLength(20);
});

it('exposes sorting as a keyboard button and announces the current direction', async () => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const { container } = render(
    <ReactTable
      columns={[{ header: 'Name', accessorKey: 'name' }]}
      data={[{ name: 'Beta' }, { name: 'Alpha' }]}
    />
  );
  const button = screen.getByRole('button', { name: 'Name' });
  button.focus();
  userEvent.keyboard('{Enter}');
  expect(button.closest('th')).toHaveAttribute('aria-sort', 'ascending');
  expect(container.querySelector('tbody tr')).toHaveTextContent('Alpha');
  userEvent.keyboard(' ');
  expect(button.closest('th')).toHaveAttribute('aria-sort', 'descending');
  expect(container.querySelector('tbody tr')).toHaveTextContent('Beta');
});
