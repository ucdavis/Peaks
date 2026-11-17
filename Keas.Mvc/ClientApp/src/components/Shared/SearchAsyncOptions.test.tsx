import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Context } from '../../Context';
import SearchAccess from '../Access/SearchAccess';
import SearchEquipment from '../Equipment/SearchEquipment';
import SearchKeys from '../Keys/SearchKeys';
import SearchKeySerials from '../Keys/SearchKeySerials';
import AssignPerson from '../People/AssignPerson';
import SearchSpaces from '../Spaces/SearchSpaces';
import SearchWorkstations from '../Workstations/SearchWorkstations';
import SearchAsyncOptions from './SearchAsyncOptions';

it('searches asynchronously, selects a server result and hides the menu on outside focus after rerender', async () => {
  const onSearch = vi.fn();
  const onChange = vi.fn();
  const props = {
    id: 'people-search',
    inputProps: { 'aria-label': 'Find person' },
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
  const input = screen.getByRole('combobox', { name: 'Find person' });
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
  fireEvent.focusIn(document.body);
  await waitFor(() =>
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  );
});

it('preserves a default selection and permits a new value', async () => {
  const onChange = vi.fn();
  render(
    <SearchAsyncOptions
      id='new-search'
      inputProps={{ 'aria-label': 'Find' }}
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

it.each([
  { name: 'Supervisor', element: <AssignPerson label='Supervisor' disabled={false} isRequired={false} onSelect={vi.fn()} /> },
  { name: 'Pick an access to assign', element: <SearchAccess onSelect={vi.fn()} onDeselect={vi.fn()} /> },
  { name: 'Pick an equipment to assign', element: <SearchEquipment space={null} onSelect={vi.fn()} onDeselect={vi.fn()} openDetailsModal={vi.fn()} /> },
  { name: 'Pick a key serial to assign', element: <SearchKeySerials onSelect={vi.fn()} onDeselect={vi.fn()} openDetailsModal={vi.fn()} /> },
  { name: 'Pick a workstation to assign', element: <SearchWorkstations space={null} onSelect={vi.fn()} onDeselect={vi.fn()} openDetailsModal={vi.fn()} /> }
])('uses the visible label "$name" for an assignment search', ({ name, element }) => {
  render(<Context.Provider value={{ team: { slug: 'test' } } as any}>
    <MemoryRouter>{element}</MemoryRouter>
  </Context.Provider>);
  const input = screen.getByRole('combobox', { name });
  expect(screen.getByLabelText(name)).toBe(input);
});

it('uses external labels for Room and key searches without overriding them', () => {
  render(<>
    <label htmlFor='room'>Room</label>
    <SearchSpaces id='room' onSelect={vi.fn()} />
    <label htmlFor='key'>Pick a key to associate</label>
    <SearchKeys id='key' onSelect={vi.fn()} onDeselect={vi.fn()} allowNew={false} />
  </>);
  expect(screen.getByRole('combobox', { name: 'Room' })).toBe(screen.getByLabelText('Room'));
  expect(screen.getByRole('combobox', { name: 'Pick a key to associate' })).toBe(screen.getByLabelText('Pick a key to associate'));
});

it('keeps standalone searches named and generates unique IDs for repeated instances', () => {
  render(<>
    <SearchSpaces onSelect={vi.fn()} />
    <SearchSpaces onSelect={vi.fn()} />
    <SearchKeys onSelect={vi.fn()} onDeselect={vi.fn()} allowNew={false} />
    <SearchKeys onSelect={vi.fn()} onDeselect={vi.fn()} allowNew={false} />
  </>);
  expect(screen.getAllByRole('combobox', { name: 'Search for space' })).toHaveLength(2);
  expect(screen.getAllByRole('combobox', { name: 'Search for key by name or by serial number' })).toHaveLength(2);
  const inputs = screen.getAllByRole('combobox');
  expect(new Set(inputs.map(input => input.id)).size).toBe(inputs.length);
});
