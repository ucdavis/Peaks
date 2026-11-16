import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AccessEditValues from '../Access/AccessEditValues';
import EquipmentEditValues from '../Equipment/EquipmentEditValues';
import KeyEditValues from '../Keys/KeyEditValues';
import KeySerialEditValues from '../Keys/KeySerialEditValues';
import WorkstationEditValues from '../Workstations/WorkstationEditValues';
import { fakeAccesses } from '../specs/mockData/Access';
import { fakeEquipment } from '../specs/mockData/Equipment';
import { fakeKeys } from '../specs/mockData/Key';
import { fakeKeySerials } from '../specs/mockData/KeySerial';
import { fakeWorkstations } from '../specs/mockData/Workstation';

afterEach(cleanup);

it('displays immutable key values as text while keeping serial edits functional', () => {
  const change = vi.fn();
  const serial = fakeKeySerials[0];
  const { container, rerender } = render(<KeySerialEditValues keySerial={serial} disableEditing changeProperty={change} />);
  expect(container.querySelector('input, select, textarea')).toBeNull();
  expect(screen.getByText(serial.key.name)).toBeTruthy();
  rerender(<KeySerialEditValues keySerial={serial} disableEditing={false} changeProperty={change} />);
  const numberInput = screen.getByDisplayValue(serial.number);
  expect(numberInput).toBeEnabled();
  expect(screen.getByRole('combobox', { name: 'Tags' })).toBeEnabled();
  expect(container.querySelector('select')).not.toBeNull();
  expect(container.querySelector('textarea')).not.toBeNull();
  fireEvent.change(numberInput, { target: { value: 'NEW-123' } });
  expect(change).toHaveBeenCalledWith('number', 'NEW-123');
});

it.each([
  {
    name: 'access',
    element: <AccessEditValues selectedAccess={fakeAccesses[0]} disableEditing={false} onAccessUpdate={vi.fn()} />,
    labels: ['Name', 'Notes', 'Tags']
  },
  {
    name: 'key',
    element: <KeyEditValues selectedKey={fakeKeys[0].key} disableEditing={false} changeProperty={vi.fn()} />,
    labels: ['Name', 'Code', 'Notes', 'Tags']
  },
  {
    name: 'key serial',
    element: <KeySerialEditValues keySerial={fakeKeySerials[0]} disableEditing={false} changeProperty={vi.fn()} />,
    labels: ['Key Serial Number', 'Status', 'Notes', 'Tags']
  },
  {
    name: 'workstation',
    element: <WorkstationEditValues selectedWorkstation={fakeWorkstations[0]} disableEditing={false} disableSpaceEditing={false} changeProperty={vi.fn()} />,
    labels: ['Name', 'Room', 'Notes', 'Tags']
  }
])('associates every $name edit field with its visible label', ({ element, labels }) => {
  render(element);
  labels.forEach(label => {
    expect(screen.getByLabelText(label, { exact: true })).toHaveAccessibleName(label);
  });
});

it('names equipment fields and documentation links', () => {
  render(<EquipmentEditValues
    selectedEquipment={{ ...fakeEquipment[0], type: 'Computer', attributes: [] }}
    disableEditing={false}
    changeProperty={vi.fn()}
    updateAttributes={vi.fn()}
  />);
  [
    'Name', 'Type', 'Serial Number / Identifier', 'Protection Level',
    'Availability Level', 'Make', 'Model', 'Managed System ID', 'Notes', 'Tags', 'Room'
  ].forEach(label => {
    expect(screen.getByLabelText(label, { exact: true })).toHaveAccessibleName(label);
  });
  expect(screen.getByRole('link', { name: 'About protection levels' })).toHaveAttribute('href');
  expect(screen.getByRole('link', { name: 'About availability levels' })).toHaveAttribute('href');
  expect(screen.getByRole('link', { name: 'About equipment attributes' })).toHaveAttribute('href');
});

it('keeps labels associated with their own controls when two key editors are mounted', () => {
  render(<>
    <KeyEditValues selectedKey={fakeKeys[0].key} disableEditing={false} changeProperty={vi.fn()} />
    <KeyEditValues selectedKey={fakeKeys[1].key} disableEditing={false} changeProperty={vi.fn()} />
  </>);
  ['Name', 'Code', 'Notes', 'Tags'].forEach(label => {
    const controls = screen.getAllByLabelText(label, { exact: true });
    expect(controls).toHaveLength(2);
    expect(controls[0].id).not.toBe(controls[1].id);
    controls.forEach(control => expect(control).toHaveAccessibleName(label));
  });
});
