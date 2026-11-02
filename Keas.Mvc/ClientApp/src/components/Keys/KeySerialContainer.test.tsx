import * as React from 'react';
import { render, cleanup, act, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router';
import { Context } from '../../Context';
import { fakeKeySerials } from '../specs/mockData/KeySerial';
import KeySerialContainer from '../Keys/KeySerialContainer';

vi.mock('../History/HistoryContainer', () => ({
  default: () => {
    return <div id='HistoryContainer'>HistoryContainer</div>;
  }
}));

let container: HTMLElement = null;
const selectedKey = {
  code: 'ADD',
  keyXSpaces: null,
  serials: null,
  title: 'Breaks',
  id: 24,
  name: 'Breaks',
  notes: null,
  tags: '',
  team: null,
  teamId: 10,
  active: true
};

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  cleanup();
  container.remove();
  container = null;
});

describe('Key Serial Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeKeySerials)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <KeySerialContainer selectedKey={selectedKey} />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const headerRecord = document.querySelector('.table-row').textContent;

    expect(headerRecord).toBe(
      ' Key Code and SNStatusAssignmentExpirationActions'
    );
  });

  it('Shows add button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeKeySerials)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <KeySerialContainer selectedKey={selectedKey} />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const headerRecord = container.querySelector('.card-header-keys')
      .textContent;
    expect(headerRecord).toContain('Add Key Serial');
  });

  it('Shows key serial list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeKeySerials)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <KeySerialContainer selectedKey={selectedKey} />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const matches = container.querySelectorAll('.asset-table tbody tr');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('ADD-1312')) {
        foundIt = true;
        expect(rowContent).toContain('Active'); // confirm status is displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of key serials', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeKeySerials)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <KeySerialContainer selectedKey={selectedKey} />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });
    const matches = container.querySelectorAll('.asset-table tbody tr');

    expect(matches.length).toBe(3);
  });

  it('Shows key serial details', async () => {
    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeKeySerials)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter
            initialEntries={['/caes-cru/keys/details/24/keyserials/details/40']}
          >
            <Route path='/:team/keys/details/:keyId/keyserials/:action?/:id?'>
              <KeySerialContainer selectedKey={selectedKey} />
            </Route>
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const detailButton = container.querySelectorAll('button')[1];
    await act(async () => { detailButton.click(); });

    const dialog = screen.getByRole('dialog');
    const values = within(dialog).getAllByRole('definition').map(value => value.textContent);
    expect(values.some(value => value.includes('ADD'))).toBe(true);
    expect(values.some(value => value.includes('Cereal'))).toBe(true);
    expect(values.some(value => value.includes('2'))).toBe(true);
    expect(dialog.querySelector('input, select, textarea')).toBeNull();
  });

  const renderTagForm = async (mode: 'create' | 'edit', tags = '') => {
    const serial = { ...fakeKeySerials[0], tags, keySerialAssignment: null };
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/ListKeySerialStatus/')) {
        return ['Active', 'Lost'];
      }
      if (init?.method === 'POST') {
        return { ...serial, ...JSON.parse(init.body as string) };
      }
      return url.includes('/details/') ? serial : [serial];
    });
    const tagContext = { ...contextObject, fetch, tags: ['Spare', 'Front desk'] };

    await act(async () => {
      render(
        <Context.Provider value={tagContext}>
          <MemoryRouter initialEntries={['/team/keys/details/24/keyserials']}>
            <Route path='/:team/keys/details/:keyId/keyserials/:action?/:id?'>
              <KeySerialContainer selectedKey={selectedKey} />
            </Route>
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    if (mode === 'create') {
      fireEvent.click(screen.getByRole('button', { name: 'Add Key Serial' }));
      fireEvent.click(screen.getByRole('button', { name: 'Create New Serial' }));
      fireEvent.change(screen.getByRole('dialog').querySelector('input[type="text"]'), {
        target: { value: 'NEW-001' }
      });
    } else {
      await act(async () => {
        fireEvent.click(screen.getByRole('link', { name: 'Details' }));
      });
      fireEvent.click(screen.getByRole('button', { name: 'Edit Serial' }));
    }

    return { fetch, dialog: screen.getByRole('dialog') };
  };

  const selectTag = (dialog: HTMLElement, tag: string) => {
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Tags' }), {
      target: { value: tag }
    });
    fireEvent.click(within(dialog).getByRole('option', { name: tag }));
  };

  it('creates a serial with the selected tags after removing a tag', async () => {
    const { fetch, dialog } = await renderTagForm('create');
    selectTag(dialog, 'Spare');
    selectTag(dialog, 'Front desk');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove Spare' }));
    expect(within(dialog).queryByRole('button', { name: 'Remove Spare' })).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Assign' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/api/team/keyserials/create',
      expect.objectContaining({ method: 'POST' })
    ));
    const request = fetch.mock.calls.find(([url]) => url === '/api/team/keyserials/create')[1];
    expect(JSON.parse(request.body as string)).toMatchObject({
      number: 'NEW-001',
      tags: 'Front desk'
    });
  });

  it('edits serial tags by adding and removing selections', async () => {
    const { fetch, dialog } = await renderTagForm('edit', 'Spare');
    expect(within(dialog).getByRole('button', { name: 'Remove Spare' })).toBeInTheDocument();
    selectTag(dialog, 'Front desk');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove Spare' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/api/team/keyserials/update/40',
      expect.objectContaining({ method: 'POST' })
    ));
    const request = fetch.mock.calls.find(([url]) => url === '/api/team/keyserials/update/40')[1];
    expect(JSON.parse(request.body as string).tags).toBe('Front desk');
  });

  it('sends an empty tags value when all serial tags are cleared', async () => {
    const { fetch, dialog } = await renderTagForm('edit', 'Spare');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Clear selection' }));
    expect(within(dialog).queryByRole('button', { name: 'Remove Spare' })).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/api/team/keyserials/update/40',
      expect.objectContaining({ method: 'POST' })
    ));
    const request = fetch.mock.calls.find(([url]) => url === '/api/team/keyserials/update/40')[1];
    expect(JSON.parse(request.body as string).tags).toBe('');
  });
});
