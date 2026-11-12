import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Switch } from 'react-router-dom';
import { Context } from '../../Context';
import { routes } from './routes';

vi.mock('../../components/Access/AccessContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/Equipment/EquipmentContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/Keys/KeyContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/People/PeopleContainer', () => ({ default: () => <div>Asset content</div> }));
vi.mock('../../components/Spaces/SpacesContainer', () => ({ default: () => <div>Asset content</div> }));

function renderRoute(path: string, permissions = ['KeyMaster']) {
  return render(
    <Context.Provider value={{ team: { slug: 'team' }, permissions, tags: [], fetch: vi.fn() } as any}>
      <MemoryRouter initialEntries={[path]}>
        <Switch>{routes}</Switch>
      </MemoryRouter>
    </Context.Provider>
  );
}

it.each(['/team/help', '/team/help/TechSupport', '/team/home', '/help'])(
  'does not render an empty asset tab bar on %s', path => {
    renderRoute(path);
    expect(screen.queryByRole('navigation', { name: 'Team assets' })).not.toBeInTheDocument();
    expect(screen.queryByText('Asset content')).not.toBeInTheDocument();
  }
);

it.each([['keys', 'Keys'], ['equipment', 'Equipment'], ['access', 'Access'], ['spaces', 'Spaces'], ['people', 'People']])(
  'keeps the asset tab bar, content, and browser title on %s pages', (asset, title) => {
    renderRoute(`/team/${asset}`);
    expect(screen.getByRole('navigation', { name: 'Team assets' })).toBeVisible();
    expect(screen.getByText('Asset content')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Keys' })).toHaveAttribute('href', '/team/keys');
    expect(document.title).toBe(`${title} - PEAKS`);
  }
);

it('updates the browser title when switching asset tabs and restores it on unmount', () => {
  document.title = 'Team Assets - PEAKS';
  const { unmount } = renderRoute('/team/people', ['DepartmentalAdmin']);
  expect(document.title).toBe('People - PEAKS');
  fireEvent.click(screen.getByRole('link', { name: 'Equipment' }));
  expect(document.title).toBe('Equipment - PEAKS');
  fireEvent.click(screen.getByRole('link', { name: 'Spaces' }));
  expect(document.title).toBe('Spaces - PEAKS');
  unmount();
  expect(document.title).toBe('Team Assets - PEAKS');
});
