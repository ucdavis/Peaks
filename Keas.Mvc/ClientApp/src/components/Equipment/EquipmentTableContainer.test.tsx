import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import EquipmentTableContainer from './EquipmentTableContainer';
import { fakeEquipment } from '../specs/mockData/Equipment';

const equipment = [
  {
    ...fakeEquipment[0],
    id: 1,
    name: 'Alpha',
    tags: 'Laptop,Loaner',
    make: 'Dell',
    model: 'Latitude',
    type: 'Laptop',
    systemManagementId: 'ABC-123',
    attributes: [{ equipmentId: 1, key: 'Owner', value: 'IT' }]
  },
  {
    ...fakeEquipment[0],
    id: 2,
    name: 'Beta',
    tags: 'Loaner',
    make: 'Dell',
    model: 'Optiplex',
    type: 'Desktop',
    systemManagementId: 'DEF-456',
    attributes: [{ equipmentId: 2, key: 'Owner', value: 'Finance' }]
  },
  {
    ...fakeEquipment[0],
    id: 3,
    name: 'Gamma',
    tags: 'Laptop',
    make: 'HP',
    model: 'EliteBook',
    type: 'Laptop',
    systemManagementId: 'ABC-999',
    attributes: [{ equipmentId: 3, key: 'Owner', value: 'IT' }]
  }
];

const setup = () =>
  render(
    <EquipmentTableContainer
      equipment={equipment}
      tags={['Laptop', 'Loaner']}
      equipmentTypes={['Laptop', 'Desktop']}
      equipmentProtectionLevels={['P1']}
      equipmentAvailabilityLevels={['A1']}
      teamSpaces={['101 Hall']}
    />
  );
const input = () =>
  screen.getByRole('combobox', { name: 'Search asset filters' });
const select = (category: string, value: string, query = '') => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: query } });
  fireEvent.click(
    within(screen.getByRole('group', { name: category })).getByRole('option', {
      name: value
    })
  );
};
const names = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody tr'))
    .filter(row => row.children.length > 1)
    .map(row => row.children[2].textContent);

afterEach(() => localStorage.clear());

it('combines categories, preserves OR within make, and removes or clears chips', () => {
  const { container } = setup();
  select('Tags', 'Laptop');
  expect(names(container)).toEqual(['Alpha', 'Gamma']);
  select('Make', 'Dell');
  expect(names(container)).toEqual(['Alpha']);
  select('Make', 'HP');
  expect(names(container)).toEqual(['Alpha', 'Gamma']);
  fireEvent.click(screen.getByLabelText('Remove Tags: Laptop'));
  expect(names(container)).toEqual(['Alpha', 'Beta', 'Gamma']);
  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
  expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
  expect(names(container)).toEqual(['Alpha', 'Beta', 'Gamma']);
});

it('preserves AND between tags and prevents selecting the same filter twice', () => {
  const { container } = setup();
  select('Tags', 'Laptop');
  select('Tags', 'Loaner');
  expect(names(container)).toEqual(['Alpha']);
  fireEvent.focus(input());
  expect(screen.queryByRole('group', { name: 'Tags' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /^Remove Tags:/ })).toHaveLength(
    2
  );
});

it('supports custom partial searches in managed system IDs and attributes', () => {
  const { container } = setup();
  select('Managed system ID', 'Search managed system id for “ABC”', 'ABC');
  expect(names(container)).toEqual(['Alpha', 'Gamma']);
  select('Attributes', 'Search attributes for “fin”', 'fin');
  expect(
    screen.getByText('No matching records found. Try adjusting your filters.')
  ).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Remove Attributes: fin'));
  expect(names(container)).toEqual(['Alpha', 'Gamma']);
});

it('supports keyboard selection and closes suggestions with Escape', () => {
  const { container } = setup();
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: 'Loaner' } });
  fireEvent.keyDown(input(), { key: 'ArrowDown' });
  expect(input()).toHaveAttribute('aria-activedescendant');
  fireEvent.keyDown(input(), { key: 'Enter' });
  expect(names(container)).toEqual(['Alpha', 'Beta']);
  expect(screen.getByLabelText('Remove Tags: Loaner')).toBeInTheDocument();
  fireEvent.focus(input());
  fireEvent.keyDown(input(), { key: 'Escape' });
  expect(input()).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
