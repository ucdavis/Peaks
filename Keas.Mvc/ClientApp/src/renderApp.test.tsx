import * as React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Root } from 'react-dom/client';
import { Route, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from './Context';
import AssetNav from './pages/assets/AssetNav';
import { renderApp } from './renderApp';

vi.mock('./pages/assets/routes', () => ({
  routes: (
    <Route path='/team/:page'>
      <Probe />
    </Route>
  )
}));

function Probe() {
  const context = React.useContext(Context);
  return (
    <AssetNav>
      <span>{context.team.name}</span>
      <span>{context.tags.join(',')}</span>
      <Link to='/team/keys'>Open keys</Link>
      <button onClick={() => context.fetch('/probe', { method: 'POST' })}>
        Fetch
      </button>
      <button onClick={() => toast.success('Saved successfully')}>
        Notify
      </button>
    </AssetNav>
  );
}

let root: Root;
let container: HTMLElement;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  window.history.replaceState({}, '', '/team/people');
  (window as any).App = {
    teamData: { name: 'Test team', slug: 'team' },
    tags: ['tag'],
    permissionsData: ['KeyMaster'],
    antiForgeryToken: 'test-token'
  };
});
afterEach(async () => {
  await act(async () => root?.unmount());
  container.remove();
  delete (window as any).App;
  vi.unstubAllGlobals();
});

it('mounts MVC context, permission links and authenticated fetch in a React 18 root', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal('fetch', fetch);
  await act(async () => {
    root = renderApp(container);
  });
  expect(screen.getByText('Test team')).toBeVisible();
  expect(screen.getByText('tag')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Keys' })).toHaveAttribute(
    'href',
    '/team/keys'
  );
  expect(
    screen.queryByRole('link', { name: 'Equipment' })
  ).not.toBeInTheDocument();
  await act(async () => fireEvent.click(screen.getByText('Fetch')));
  expect(fetch).toHaveBeenCalledWith(
    '/probe',
    expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: expect.arrayContaining([
        ['RequestVerificationToken', 'test-token']
      ])
    })
  );
  fireEvent.click(screen.getByText('Open keys'));
  expect(window.location.pathname).toBe('/team/keys');
  expect(screen.getByRole('link', { name: 'Keys' })).toHaveClass('active');
  await act(async () => window.history.back());
  await waitFor(() => expect(window.location.pathname).toBe('/team/people'));
  await act(async () => window.history.forward());
  await waitFor(() =>
    expect(screen.getByRole('link', { name: 'Keys' })).toHaveClass('active')
  );
});

it('renders and dismisses success notifications', async () => {
  await act(async () => {
    root = renderApp(container);
  });
  fireEvent.click(screen.getByText('Notify'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Saved successfully'
  );
  fireEvent.click(screen.getByRole('button', { name: 'close' }));
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  );
});

it('leaves server-rendered content intact when MVC has no App data or matching route', async () => {
  delete (window as any).App;
  window.history.replaceState({}, '', '/help');
  const mvc = document.createElement('main');
  mvc.textContent = 'Server-rendered content';
  document.body.appendChild(mvc);
  await act(async () => {
    root = renderApp(container);
  });
  expect(screen.getByText('Server-rendered content')).toBeVisible();
  expect(container.querySelector('.react-tabs')).toBeNull();
  expect((window as any).App.antiForgeryToken).toBe('');
  mvc.remove();
});
