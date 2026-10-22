import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Switch } from 'react-router-dom';
import { Context } from '../../Context';
import { routes } from './routes';

vi.mock('../../components/Access/AccessContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/Equipment/EquipmentContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/Keys/KeyContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/People/PeopleContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/Spaces/SpacesContainer', () => ({ default: () => <div>Asset content</div> }));

function renderRoute(path: string) {
  return render(
    <Context.Provider value={{ team: { slug: 'team' }, permissions: ['KeyMaster'], tags: [], fetch: vi.fn() } as any}>
      <MemoryRouter initialEntries={[path]}>
        <Switch>{routes}</Switch>
      </MemoryRouter>
    </Context.Provider>
  );
}

it.each(['/team/help', '/team/help/TechSupport', '/team/home', '/help'])(
  'does not render an empty asset tab bar on %s', path => {
    const { container } = renderRoute(path);
    expect(container.querySelector('.react-tabs')).toBeNull();
    expect(screen.queryByText('Asset content')).not.toBeInTheDocument();
  }
);

it.each(['keys', 'equipment', 'access', 'spaces', 'people'])(
  'keeps the asset tab bar and content on %s pages', asset => {
    const { container } = renderRoute(`/team/${asset}`);
    expect(container.querySelector('.react-tabs')).not.toBeNull();
    expect(screen.getByText('Asset content')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Keys' })).toHaveAttribute('href', '/team/keys');
  }
);
