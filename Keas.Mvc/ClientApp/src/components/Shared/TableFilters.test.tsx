import * as React from 'react';
import {
  render,
  fireEvent,
  within,
  cleanup,
  screen
} from '@testing-library/react';
import EquipmentTable from '../Equipment/EquipmentTable';
import AccessTable from '../Access/AccessTable';
import KeySerialTable from '../Keys/KeySerialTable';
import { fakeEquipment } from '../specs/mockData/Equipment';
import { fakeAccesses } from '../specs/mockData/Access';
import { fakeKeySerials } from '../specs/mockData/KeySerial';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

const names = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody tr')).map(
    row => row.children[2].textContent
  );

it.each([
  ['expired', ['Past', 'Now']],
  ['unexpired', ['Later', 'Three weeks', 'Six weeks']],
  ['3weeks', ['Later']],
  ['6weeks', ['Later', 'Three weeks']],
  ['unassigned', ['Missing']],
  ['all', ['Later', 'Missing', 'Now', 'Past', 'Six weeks', 'Three weeks']]
])(
  'preserves equipment expiration filter %s and its exclusive week boundaries',
  (filter, expected) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 22, 12));
    const dates = [
      new Date(2026, 9, 21),
      new Date(2026, 9, 22, 12),
      new Date(2026, 9, 22, 13),
      new Date(2026, 10, 12),
      new Date(2026, 11, 3),
      null
    ];
    const labels = [
      'Past',
      'Now',
      'Later',
      'Three weeks',
      'Six weeks',
      'Missing'
    ];
    const equipment = dates.map((expiresAt, id) => ({
      ...fakeEquipment[0],
      id,
      name: labels[id],
      assignment: { ...fakeEquipment[0].assignment, expiresAt }
    }));
    const { container } = render(<EquipmentTable equipment={equipment} />);
    fireEvent.change(container.querySelector('thead select'), {
      target: { value: filter }
    });
    expect(names(container).sort()).toEqual([...expected].sort());
  }
);

it('preserves zero, comparison operators and clearing assignment-count filters', () => {
  const accesses = [0, 1, 2].map(count => ({
    ...fakeAccesses[0],
    id: count,
    name: `Count ${count}`,
    assignments: Array.from(
      { length: count },
      () => fakeAccesses[0].assignments[0]
    )
  }));
  const { container } = render(<AccessTable accesses={accesses} />);
  const filterRow = container.querySelector('thead').children[1];
  const countControls = within(filterRow.children[2] as HTMLElement);
  const input = countControls.getByRole('textbox');
  const operator = countControls.getByRole('combobox');
  const shown = () =>
    Array.from(container.querySelectorAll('tbody tr')).map(
      row => row.children[1].textContent
    );
  fireEvent.change(input, { target: { value: '0' } });
  expect(shown()).toEqual(['Count 0']);
  fireEvent.change(operator, { target: { value: '>' } });
  expect(shown()).toEqual(['Count 1', 'Count 2']);
  fireEvent.change(input, { target: { value: '2' } });
  fireEvent.change(operator, { target: { value: '<' } });
  expect(shown()).toEqual(['Count 0', 'Count 1']);
  fireEvent.change(input, { target: { value: '' } });
  expect(shown()).toEqual(['Count 0', 'Count 1', 'Count 2']);
});

it('details and actions retain the original equipment after sorting and filtering', () => {
  const equipment = ['Zulu', 'Alpha'].map((name, id) => ({
    ...fakeEquipment[0],
    id,
    name
  }));
  const details = vi.fn();
  const revoke = vi.fn();
  const { container } = render(
    <EquipmentTable
      equipment={equipment}
      showDetails={details}
      onRevoke={revoke}
    />
  );
  fireEvent.change(container.querySelectorAll('thead input')[1], {
    target: { value: 'zUL' }
  });
  const row = within(container.querySelector('tbody tr'));
  fireEvent.click(row.getByText('Details'));
  expect(details).toHaveBeenCalledWith(equipment[0]);
  fireEvent.click(row.getByRole('button', { name: 'Row actions' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Revoke' }));
  expect(revoke).toHaveBeenCalledWith(equipment[0]);
});

const serialsWithTags = [
  'Spare,Front desk',
  'Spare',
  'Front desk',
  'Spare-room',
  null,
  undefined,
  '',
  ' Front desk, Spare '
].map((tags, id) => ({
  ...fakeKeySerials[0],
  id,
  number: `${id}`,
  status: id === 1 ? 'Lost' : 'Active',
  tags,
  key: { ...fakeKeySerials[0].key, tags: 'Spare,Front desk' }
}));

const selectSerialTag = (tag: string) => {
  fireEvent.change(screen.getByRole('combobox', { name: 'Search asset filters' }), {
    target: { value: tag }
  });
  fireEvent.click(screen.getByRole('option', { name: tag }));
};

const shownSerials = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody tr'))
    .filter(row => row.children.length > 1)
    .map(row => row.children[1].textContent)
    .sort();

it('combines exact serial tags and restores rows when tag filters are removed or cleared', () => {
  const { container } = render(
    <KeySerialTable keySerials={serialsWithTags} tags={['Spare', 'Front desk']} />
  );
  const allSerials = serialsWithTags.map(serial => `ADD-${serial.number}`);
  expect(shownSerials(container)).toEqual(allSerials);

  selectSerialTag('Spare');
  expect(shownSerials(container)).toEqual(['ADD-0', 'ADD-1', 'ADD-7']);
  selectSerialTag('Front desk');
  expect(shownSerials(container)).toEqual(['ADD-0', 'ADD-7']);

  fireEvent.click(screen.getByRole('button', { name: 'Remove Tags: Spare' }));
  expect(shownSerials(container)).toEqual(['ADD-0', 'ADD-2', 'ADD-7']);
  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
  expect(shownSerials(container)).toEqual(allSerials);
  expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
});

it('combines serial tags with status and retains the status filter when tags are cleared', () => {
  const { container } = render(
    <KeySerialTable keySerials={serialsWithTags} tags={['Spare', 'Front desk']} />
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Filter status' }), {
    target: { value: 'inactive' }
  });
  selectSerialTag('Spare');
  expect(shownSerials(container)).toEqual(['ADD-1']);
  selectSerialTag('Front desk');
  expect(shownSerials(container)).toEqual([]);
  expect(screen.getByText('No matching records found. Try adjusting your filters.'))
    .toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
  expect(shownSerials(container)).toEqual(['ADD-1']);
  expect(screen.getByRole('combobox', { name: 'Filter status' })).toHaveValue('inactive');
});
