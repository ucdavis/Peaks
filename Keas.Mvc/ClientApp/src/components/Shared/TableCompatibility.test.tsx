import * as React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import AccessTable from '../Access/AccessTable';
import AccessAssignmentTable from '../Access/AccessAssignmentTable';
import EquipmentTable from '../Equipment/EquipmentTable';
import KeySerialTable from '../Keys/KeySerialTable';
import KeyTable from '../Keys/KeyTable';
import PeopleTable from '../People/PeopleTable';
import SpacesTable from '../Spaces/SpacesTable';
import { fakeAccesses } from '../specs/mockData/Access';
import { fakeEquipment } from '../specs/mockData/Equipment';
import { fakeKeySerials } from '../specs/mockData/KeySerial';
import { fakeSpaces } from '../specs/mockData/Space';

beforeEach(() => localStorage.setItem('PeaksDefaultPageSize', '10'));
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const equipmentRows = (names: string[]) =>
  names.map((name, id) => ({ ...fakeEquipment[0], id, name }));
const serialRows = (names: string[]) =>
  names.map((code, id) => ({
    ...fakeKeySerials[0],
    id,
    number: '1',
    status: 'Active',
    key: { ...fakeKeySerials[0].key, code }
  }));
const assignmentRows = (names: string[]) =>
  names.map((lastName, id) => ({
    ...fakeAccesses[0].assignments[0],
    id,
    person: {
      ...fakeAccesses[0].assignments[0].person,
      lastName,
      firstName: ''
    }
  }));
const spaceRows = (names: string[]) =>
  names.map((roomNumber, id) => ({
    ...fakeSpaces[0],
    id,
    space: { ...fakeSpaces[0].space, id, roomNumber, bldgName: '' }
  }));

const tableCases = [
  {
    name: 'equipment',
    header: 'Name',
    element: (names, showDetails) => (
      <EquipmentTable
        equipment={equipmentRows(names)}
        showDetails={showDetails}
      />
    )
  },
  {
    name: 'access',
    header: 'Name',
    element: (names, showDetails) => (
      <AccessTable
        accesses={names.map((name, id) => ({ ...fakeAccesses[0], id, name }))}
        showDetails={showDetails}
      />
    )
  },
  {
    name: 'access assignments',
    header: 'Assignment',
    element: (names, showDetails) => (
      <AccessAssignmentTable
        accessAssignments={assignmentRows(names)}
        showDetails={showDetails}
      />
    )
  },
  {
    name: 'key serials',
    header: 'Key Code and SN',
    element: (names, showDetails) => (
      <KeySerialTable
        keySerials={serialRows(names)}
        showDetails={showDetails}
      />
    )
  },
  {
    name: 'keys',
    header: 'Key Name',
    element: (names, showDetails) => (
      <KeyTable
        keysInfo={names.map((name, id) => ({
          id,
          key: { ...fakeKeySerials[0].key, id, name },
          serialsInUseCount: 0,
          serialsTotalCount: 1,
          spacesCount: 0
        }))}
        filters={[]}
        onFiltersChange={vi.fn()}
        showDetails={showDetails}
      />
    )
  },
  {
    name: 'people',
    header: 'Name',
    element: (names, showDetails) => (
      <PeopleTable
        people={names.map((lastName, id) => ({
          id,
          person: {
            ...fakeEquipment[0].assignment.person,
            lastName,
            firstName: ''
          },
          accessCount: 0,
          equipmentCount: 0,
          keyCount: 0,
          workstationCount: 0
        }))}
        filtered={[]}
        updateFilters={vi.fn()}
        showDetails={showDetails}
      />
    )
  },
  {
    name: 'spaces',
    header: 'Room',
    element: (names, showDetails) => (
      <SpacesTable
        spaces={spaceRows(names)}
        filtered={[]}
        updateFilters={vi.fn()}
        showDetails={showDetails}
      />
    )
  }
];

const shownIds = (
  container: HTMLElement,
  details: ReturnType<typeof vi.fn>
) => {
  details.mockClear();
  within(container.querySelector('tbody'))
    .queryAllByText('Details')
    .forEach(button => {
      fireEvent.click(button);
    });
  return details.mock.calls.map(([record]) => record.id);
};

it.each(tableCases)(
  'preserves case, natural numbers and ties in $name',
  ({ header, element }) => {
    const details = vi.fn();
    const { container } = render(
      element(['apple', 'Item 10', 'Zebra', 'Item 2', 'Zebra'], details)
    );
    expect(shownIds(container, details)).toEqual([3, 1, 2, 4, 0]);
    const heading = screen.getByText(header);
    fireEvent.click(heading);
    if (heading.closest('th').classList.contains('sort-asc')) {
      fireEvent.click(heading);
    }
    expect(heading.closest('th')).toHaveClass('sort-desc');
    expect(shownIds(container, details)).toEqual([0, 4, 2, 1, 3]);
    fireEvent.click(heading);
    expect(shownIds(container, details)).toEqual([0, 1, 2, 3, 4]);
  }
);

it('rejects page jumps outside the bounds and guards all navigation controls', () => {
  const { container } = render(
    <EquipmentTable
      equipment={equipmentRows(
        Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`)
      )}
    />
  );
  const jump = screen.getByRole('spinbutton');
  const page = () => container.querySelector('.pagination strong').textContent;
  const navigate = (label: string) =>
    fireEvent.click(screen.getByLabelText(label));
  expect(page()).toBe('1 of 3');
  navigate('First');
  navigate('Previous');
  expect(page()).toBe('1 of 3');
  navigate('Next');
  expect(page()).toBe('2 of 3');
  for (const value of ['4', '0', '-1', '100']) {
    fireEvent.change(jump, { target: { value } });
    expect(page()).toBe('2 of 3');
    expect(container.querySelector('tbody tr')).toHaveTextContent('Item 11');
  }
  fireEvent.change(jump, { target: { value: '3' } });
  expect(page()).toBe('3 of 3');
  expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
  navigate('Next');
  navigate('Last');
  expect(page()).toBe('3 of 3');
  expect(screen.getByLabelText('Next')).toBeDisabled();
  navigate('Previous');
  navigate('Last');
  expect(page()).toBe('3 of 3');
  navigate('First');
  expect(page()).toBe('1 of 3');
  navigate('Last');
  fireEvent.change(jump, { target: { value: '' } });
  expect(page()).toBe('1 of 3');
});

it('retains sort and filter on replacement while resetting pages and persisting size', async () => {
  const details = vi.fn();
  const data = equipmentRows(
    Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`)
  );
  const { container, rerender } = render(
    <EquipmentTable equipment={data} showDetails={details} />
  );
  fireEvent.click(screen.getByText('Name'));
  fireEvent.change(container.querySelectorAll('thead input')[1], {
    target: { value: 'iTEM' }
  });
  fireEvent.click(screen.getByLabelText('Last'));
  expect(container.querySelector('.pagination strong')).toHaveTextContent(
    '3 of 3'
  );
  fireEvent.change(container.querySelector('.pagination select'), {
    target: { value: '20' }
  });
  expect(localStorage.getItem('PeaksDefaultPageSize')).toBe('20');
  expect(container.querySelector('.pagination strong')).toHaveTextContent(
    '2 of 2'
  );
  const replacement = [
    ...data.slice(0, 12),
    { ...data[0], id: 99, name: 'Other' }
  ];
  rerender(<EquipmentTable equipment={replacement} showDetails={details} />);
  await waitFor(() =>
    expect(container.querySelector('.pagination strong')).toHaveTextContent(
      '1 of 1'
    )
  );
  expect(shownIds(container, details)).toEqual(
    Array.from({ length: 12 }, (_, i) => 11 - i)
  );
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } });
  expect(container.querySelector('.pagination strong')).toHaveTextContent(
    '1 of 1'
  );
  fireEvent.change(container.querySelectorAll('thead input')[1], {
    target: { value: 'absent' }
  });
  await waitFor(() =>
    expect(container.querySelector('.pagination strong')).toHaveTextContent(
      '0 of 0'
    )
  );
  for (const label of ['First', 'Previous', 'Next', 'Last']) {
    fireEvent.click(screen.getByLabelText(label));
    expect(container.querySelector('.pagination strong')).toHaveTextContent(
      '0 of 0'
    );
  }
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
  expect(container.querySelector('.pagination strong')).toHaveTextContent(
    '0 of 0'
  );
  cleanup();
  const second = render(<EquipmentTable equipment={data} />);
  expect(second.container.querySelector('.pagination select')).toHaveValue(
    '20'
  );
  expect(second.container.querySelectorAll('tbody tr')).toHaveLength(20);
});

it.each(['equipment', 'key serials'])(
  'preserves missing expiration ordering in %s',
  kind => {
    const details = vi.fn();
    const expirations = [
      undefined,
      '2026-10-23T00:00:00',
      null,
      '2026-10-22T00:00:00',
      undefined
    ];
    const { container } = render(
      kind === 'equipment' ? (
        <EquipmentTable
          equipment={equipmentRows(expirations.map((_, i) => `Item ${i}`)).map(
            (row, i) => ({
              ...row,
              assignment:
                expirations[i] === undefined
                  ? null
                  : {
                      ...row.assignment,
                      expiresAt: expirations[i] as any
                    }
            })
          )}
          showDetails={details}
        />
      ) : (
        <KeySerialTable
          keySerials={serialRows(expirations.map((_, i) => `Item ${i}`)).map(
            (row, i) => ({
              ...row,
              keySerialAssignment:
                expirations[i] === undefined
                  ? null
                  : {
                      ...row.keySerialAssignment,
                      expiresAt: expirations[i] as any
                    }
            })
          )}
          showDetails={details}
        />
      )
    );
    fireEvent.click(screen.getByText('Expiration'));
    expect(shownIds(container, details)).toEqual([0, 2, 4, 3, 1]);
    fireEvent.click(screen.getByText('Expiration'));
    expect(shownIds(container, details)).toEqual([1, 3, 4, 2, 0]);
  }
);

it('preserves descending ties for the custom access expiration comparator', () => {
  const details = vi.fn();
  const { container } = render(
    <AccessTable
      accesses={['First', 'Second', 'Third'].map((name, id) => ({
        ...fakeAccesses[0],
        name,
        id
      }))}
      showDetails={details}
    />
  );
  fireEvent.click(screen.getByText('First Expiration'));
  expect(shownIds(container, details)).toEqual([0, 1, 2]);
  fireEvent.click(screen.getByText('First Expiration'));
  expect(shownIds(container, details)).toEqual([2, 1, 0]);
});

it.each(['Status', 'Key Code and SN'])(
  'replaces initial multi-sort when clicking %s',
  header => {
    const details = vi.fn();
    const rows = serialRows(['Zulu', 'Alpha', 'Beta']);
    const { container } = render(
      <KeySerialTable keySerials={rows} showDetails={details} />
    );
    expect(shownIds(container, details)).toEqual([1, 2, 0]);
    fireEvent.click(screen.getByText(header));
    expect(screen.getByText(header).closest('th')).toHaveClass('sort-asc');
    expect(
      container.querySelectorAll('th.sort-asc, th.sort-desc')
    ).toHaveLength(1);
    expect(shownIds(container, details)).toEqual(
      header === 'Status' ? [0, 1, 2] : [1, 2, 0]
    );
  }
);

it('replaces the initial assignment multi-sort and preserves original-object callbacks', () => {
  const details = vi.fn();
  const rows = assignmentRows(['Same', 'Same']).map((row, i) => ({
    ...row,
    expiresAt: new Date(2026, 9, 24 - i)
  }));
  const { container } = render(
    <AccessAssignmentTable accessAssignments={rows} showDetails={details} />
  );
  fireEvent.click(screen.getByText('Assignment'));
  expect(screen.getByText('Assignment').closest('th')).toHaveClass('sort-asc');
  expect(shownIds(container, details)).toEqual([0, 1]);
  expect(details.mock.calls[0][0]).toBe(rows[0]);
  expect(details.mock.calls[1][0]).toBe(rows[1]);
});

it('uses the primary direction for ties through Shift multi-sort transitions', () => {
  const details = vi.fn();
  const rows = serialRows(['Beta', 'Alpha', 'Alpha', 'Zulu']).map((row, i) => ({
    ...row,
    status: i === 3 ? 'Lost' : 'Active'
  }));
  const { container } = render(
    <KeySerialTable keySerials={rows} showDetails={details} />
  );
  expect(shownIds(container, details)).toEqual([1, 2, 0, 3]);
  fireEvent.click(screen.getByText('Status'), { shiftKey: true });
  expect(shownIds(container, details)).toEqual([3, 2, 1, 0]);
  fireEvent.click(screen.getByText('Key Code and SN'), { shiftKey: true });
  expect(shownIds(container, details)).toEqual([3, 0, 2, 1]);
  fireEvent.click(screen.getByText('Key Code and SN'), { shiftKey: true });
  expect(shownIds(container, details)).toEqual([3, 2, 1, 0]);
  fireEvent.click(screen.getByText('Key Code and SN'), { shiftKey: true });
  expect(shownIds(container, details)).toEqual([3, 2, 1, 0]);
  fireEvent.click(screen.getByText('Key Code and SN'));
  expect(shownIds(container, details)).toEqual([1, 2, 0, 3]);
  fireEvent.click(screen.getByText('Status'), { shiftKey: true });
  fireEvent.click(screen.getByText('Status'), { shiftKey: true });
  expect(shownIds(container, details)).toEqual([1, 2, 0, 3]);
});

it.each(['equipment', 'spaces'])(
  'stringifies null and undefined text filters in %s',
  kind => {
    const details = vi.fn();
    const values = [null, undefined, 'NuLl label', 'UNDEFINED label', 'Other'];
    const { container } = render(
      kind === 'equipment' ? (
        <EquipmentTable
          equipment={equipmentRows(values.map((_, i) => `Item ${i}`)).map(
            (row, i) => ({
              ...row,
              serialNumber: values[i]
            })
          )}
          showDetails={details}
        />
      ) : (
        <SpacesTable
          spaces={spaceRows(values.map((_, i) => `Item ${i}`)).map(
            (row, i) => ({
              ...row,
              space: { ...row.space, roomName: values[i] }
            })
          )}
          filtered={[]}
          updateFilters={vi.fn()}
          showDetails={details}
        />
      )
    );
    const input = container.querySelectorAll('thead input')[
      kind === 'equipment' ? 0 : 1
    ];
    fireEvent.change(input, { target: { value: 'NULL' } });
    expect(shownIds(container, details)).toEqual([0, 2]);
    fireEvent.change(input, { target: { value: 'undefined' } });
    expect(shownIds(container, details)).toEqual([1, 3]);
    fireEvent.change(input, { target: { value: '' } });
    expect(shownIds(container, details)).toEqual([0, 1, 2, 3, 4]);
  }
);
