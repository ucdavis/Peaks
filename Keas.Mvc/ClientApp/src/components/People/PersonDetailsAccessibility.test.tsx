import { cleanup, render, screen } from '@testing-library/react';
import { Context } from '../../Context';
import AccessList from '../Access/AccessList';
import EquipmentList from '../Equipment/EquipmentList';
import HistoryList from '../History/HistoryList';
import KeySerialList from '../Keys/KeySerialList';
import KeyList from '../Keys/KeyList';
import SpacesList from '../Spaces/SpacesList';
import WorkstationList from '../Workstations/WorkstationList';
import { fakeEquipment } from '../specs/mockData/Equipment';
import BioContainer from './BioContainer';

afterEach(cleanup);

it.each([
  ['access', <AccessList accessAssignments={[]} personView personId={1} showDetails={vi.fn()} />],
  ['equipment', <EquipmentList equipment={[]} />],
  ['key serials', <KeySerialList keySerials={[]} />],
  ['keys', <KeyList keysInfo={[]} />],
  ['spaces', <SpacesList spaces={[]} />],
  ['workstations', <WorkstationList workstations={[]} detailsBasePath='' />]
])('covers every %s column with the empty-state data cell', (_name, element) => {
  render(element);
  expect(screen.getByRole('cell')).toHaveAttribute(
    'colspan', String(screen.getAllByRole('columnheader').length)
  );
});

const context = {
  fetch: vi.fn(),
  permissions: [],
  team: { id: 1, name: 'Team', slug: 'team' },
  tags: []
};

it('keeps history content without an empty table header container', () => {
  const { container } = render(
    <Context.Provider value={context}>
      <HistoryList histories={[{
        id: 1, description: 'Assigned equipment', actedDate: new Date('2026-11-17'), link: null
      }]} />
    </Context.Provider>
  );
  expect(screen.getByRole('cell', { name: 'Assigned equipment' })).toBeVisible();
  expect(container.querySelector('thead')).toBeNull();
});

it('keeps the direct-reports link without an empty contact description list', () => {
  const person = {
    ...fakeEquipment[0].assignment.person,
    email: null, userId: null, homePhone: null, teamPhone: null,
    supervisor: null, isSupervisor: true
  };
  const { container, rerender } = render(
    <Context.Provider value={context}><BioContainer person={person} /></Context.Provider>
  );
  expect(screen.getByRole('link', { name: 'View direct reports' })).toHaveAttribute(
    'href', `/team/Report/SupervisorDirectReports/?personId=${person.id}`
  );
  expect(container.querySelector('dl')).toBeNull();
  rerender(
    <Context.Provider value={context}>
      <BioContainer person={{ ...person, email: 'person@example.com' }} />
    </Context.Provider>
  );
  expect(container.querySelector('dl dt')).toHaveTextContent('Email');
  expect(screen.getByRole('link', { name: 'person@example.com' })).toBeVisible();
});
