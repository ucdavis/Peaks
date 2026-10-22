import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchAsyncOptions from './SearchAsyncOptions';

it('searches asynchronously, selects a server result and hides the menu on blur after rerender', async () => {
  const onSearch = vi.fn();
  const onChange = vi.fn();
  const props = {
    id: 'people-search',
    isLoading: false,
    minLength: 2,
    placeholder: 'Find person',
    labelKey: 'name',
    allowNew: false,
    renderMenuItemChildren: option => <span>{option.name}</span>,
    onSearch,
    onChange,
    options: []
  };
  const { rerender } = render(<SearchAsyncOptions {...props} />);
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'Sa' } });
  await waitFor(() => expect(onSearch).toHaveBeenCalledWith('Sa'));
  const person = { id: 1, name: 'Sandbox Person' };
  rerender(<SearchAsyncOptions {...props} options={[person]} />);
  fireEvent.click(
    await screen.findByRole('option', { name: 'Sandbox Person' })
  );
  expect(onChange).toHaveBeenLastCalledWith([person]);
  expect(input).toHaveValue('Sandbox Person');
  fireEvent.change(input, { target: { value: 'San' } });
  await waitFor(() => expect(onSearch).toHaveBeenCalledWith('San'));
  rerender(<SearchAsyncOptions {...props} options={[person]} />);
  expect(await screen.findByRole('option')).toBeVisible();
  fireEvent.blur(input);
  await waitFor(() =>
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  );
});

it('preserves a default selection and permits a new value', async () => {
  const onChange = vi.fn();
  render(
    <SearchAsyncOptions
      id='new-search'
      isLoading={false}
      minLength={1}
      placeholder='Find'
      labelKey='name'
      allowNew
      renderMenuItemChildren={option => <span>{option.name}</span>}
      onSearch={vi.fn()}
      onChange={onChange}
      options={[]}
      defaultSelected={[{ name: 'Existing' }]}
    />
  );
  const input = screen.getByRole('combobox');
  expect(input).toHaveValue('Existing');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'New person' } });
  fireEvent.click(await screen.findByRole('option'));
  expect(onChange).toHaveBeenLastCalledWith([
    expect.objectContaining({ name: 'New person', customOption: true })
  ]);
});
