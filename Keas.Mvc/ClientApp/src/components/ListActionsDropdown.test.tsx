import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ListActionsDropdown from './ListActionsDropdown';

it('hides actions until opened, renders outside the table, and closes after selection', async () => {
  const assign = vi.fn();
  const { container } = render(
    <div className='overflow-x-auto'>
      <ListActionsDropdown
        actions={[
          { title: 'Assign', onClick: assign },
          { title: 'Delete', onClick: vi.fn() }
        ]}
      />
    </div>
  );
  const trigger = screen.getByRole('button', { name: 'Row actions' });
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(screen.queryByText('Assign')).not.toBeInTheDocument();
  fireEvent.click(trigger);
  const menu = screen.getByRole('menu');
  expect(container.contains(menu)).toBe(false);
  expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
    'text-error'
  );
  fireEvent.click(screen.getByRole('menuitem', { name: 'Assign' }));
  expect(assign).toHaveBeenCalledOnce();
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

it('closes with Escape and does not show an empty actions menu', async () => {
  const { rerender } = render(
    <ListActionsDropdown actions={[{ title: 'Assign', onClick: vi.fn() }]} />
  );
  const trigger = screen.getByRole('button', { name: 'Row actions' });
  fireEvent.click(trigger);
  fireEvent.keyDown(screen.getByRole('menuitem'), {
    key: 'Escape',
    keyCode: 27,
    which: 27
  });
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  );
  expect(trigger).toHaveFocus();
  rerender(<ListActionsDropdown actions={[]} />);
  expect(
    screen.queryByRole('button', { name: 'Row actions' })
  ).not.toBeInTheDocument();
});
