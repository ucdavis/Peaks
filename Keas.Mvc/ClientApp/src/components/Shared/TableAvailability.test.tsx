import * as React from 'react';
import { cleanup, fireEvent, render, within, screen } from '@testing-library/react';
import KeyTable from '../Keys/KeyTable';
import KeySerialTable from '../Keys/KeySerialTable';
import SpacesTable from '../Spaces/SpacesTable';
import { fakeKeySerials } from '../specs/mockData/KeySerial';
import { fakeSpaces } from '../specs/mockData/Space';

afterEach(cleanup);

it.each([
  ['all', [0, 1, 2, 3]],
  ['unassigned', [1, 2]],
  ['assigned', [2, 3]],
  ['hasSerial', [1, 2, 3]],
  ['noSerial', [0]]
])(
  'filters key availability with %s and passes the original key to Details',
  (filter, expected) => {
    const rows = [
      [0, 0],
      [0, 2],
      [1, 2],
      [2, 2]
    ].map(([used, total], id) => ({
      id,
      key: { ...fakeKeySerials[0].key, id, name: `Key ${id}` },
      serialsInUseCount: used,
      serialsTotalCount: total,
      spacesCount: 0
    }));
    const details = vi.fn();
    const { container } = render(
      <KeyTable
        keysInfo={rows}
        filters={[]}
        onFiltersChange={vi.fn()}
        showDetails={details}
      />
    );
    fireEvent.change(container.querySelector('thead select'), {
      target: { value: filter }
    });
    within(container.querySelector('tbody'))
      .queryAllByText('Details')
      .forEach(button => fireEvent.click(button));
    expect(details.mock.calls.map(([key]) => key.id)).toEqual(expected);
    details.mock.calls.forEach(([key]) => expect(key).toBe(rows[key.id].key));
    expect(
      container.querySelector('thead tr').children[3].querySelector('button')
    ).toBeNull();
  }
);

it.each([
  ['all', [0, 2, 3, 1, 4]],
  ['active', [0]],
  ['inactive', [2, 3, 1]],
  ['special', [4]]
])(
  'filters serial status with %s and keeps assignment actions attached to the original serial',
  (filter, expected) => {
    const rows = ['Active', 'Lost', 'Destroyed', 'Dog ate', 'Special'].map(
      (status, id) => ({
        ...fakeKeySerials[0],
        id,
        number: `${id}`,
        status,
        keySerialAssignment:
          id === 0 ? null : fakeKeySerials[0].keySerialAssignment
      })
    );
    const details = vi.fn();
    const assign = vi.fn();
    const revoke = vi.fn();
    const { container } = render(
      <KeySerialTable
        keySerials={rows}
        showDetails={details}
        onAssign={assign}
        onRevoke={revoke}
      />
    );
    fireEvent.change(container.querySelector('thead select'), {
      target: { value: filter }
    });
    const visibleRows = within(container.querySelector('tbody')).queryAllByRole(
      'row'
    );
    visibleRows.forEach((row, index) => {
      const controls = within(row);
      fireEvent.click(controls.getByText('Details'));
      const original = rows[(expected as number[])[index]];
      expect(details).toHaveBeenLastCalledWith(original);
      expect(details.mock.calls.at(-1)[0]).toBe(original);
      fireEvent.click(controls.getByRole('button', { name: 'Row actions' }));
      const action = original.keySerialAssignment ? 'Revoke' : 'Assign';
      expect(
        screen.queryByRole('menuitem', {
          name: action === 'Assign' ? 'Revoke' : 'Assign'
        })
      ).toBeNull();
      fireEvent.click(screen.getByRole('menuitem', { name: action }));
      expect((action === 'Assign' ? assign : revoke).mock.calls.at(-1)[0]).toBe(
        original
      );
    });
    expect(details.mock.calls.map(([serial]) => serial.id)).toEqual(expected);
  }
);

it.each([
  ['all', [0, 1, 2, 3]],
  ['unassigned', [1, 2]],
  ['assigned', [2, 3]],
  ['any', [1, 2, 3]]
])(
  'filters workstation availability with %s, excluding rooms without desks from Unassigned',
  (filter, expected) => {
    const rows = [
      [0, 0],
      [0, 2],
      [1, 2],
      [2, 2]
    ].map(([used, total], id) => ({
      ...fakeSpaces[0],
      id,
      space: { ...fakeSpaces[0].space, id, roomNumber: `Room ${id}` },
      workstationsInUse: used,
      workstationsTotal: total
    }));
    const details = vi.fn();
    const { container } = render(
      <SpacesTable
        spaces={rows}
        filtered={[]}
        updateFilters={vi.fn()}
        showDetails={details}
      />
    );
    fireEvent.change(container.querySelector('thead select'), {
      target: { value: filter }
    });
    within(container.querySelector('tbody'))
      .queryAllByText('Details')
      .forEach(button => fireEvent.click(button));
    expect(details.mock.calls.map(([space]) => space.id)).toEqual(expected);
    details.mock.calls.forEach(([space]) =>
      expect(space).toBe(rows[space.id].space)
    );
    expect(
      container
        .querySelector('thead tr')
        .lastElementChild.querySelector('button')
    ).toBeNull();
    expect(
      container
        .querySelector('thead tr:nth-child(2)')
        .children[3].querySelector('input')
    ).toBeNull();
  }
);
