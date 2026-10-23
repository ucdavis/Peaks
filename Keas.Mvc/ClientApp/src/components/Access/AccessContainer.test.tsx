import { within } from '@testing-library/react';
import * as React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Context } from '../../Context';
import { routes } from '../../pages/assets/routes';
import { fakeAccesses } from '../specs/mockData/Access';
import AccessContainer from '../Access/AccessContainer';

let container: HTMLElement = null;

// mock out the sub containers, at least for now
vi.mock('../Access/AccessAssignmentContainer', () => ({
  default: () => {
    return <div id='AccessAssignmentContainer'>AccessAssignmentContainer</div>;
  }
}));

vi.mock('../History/HistoryContainer', () => ({
  default: () => {
    return <div id='HistoryContainer'>HistoryContainer</div>;
  }
}));

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

describe('Access Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake accesses
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeAccesses)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <AccessContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const headerRecord = container.querySelector('.table-row').textContent;
    expect(headerRecord).toBe(
      ' NameNumber of AssignmentsAssigned ToFirst ExpirationActions'
    );
  });

  it('Shows Add Button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake accesses
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeAccesses)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <AccessContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const headerRecord = container.querySelector('.card-header-access')
      .textContent;
    expect(headerRecord).toContain('Add Access');
  });

  it('Shows access list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake accesses
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeAccesses)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <AccessContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    const matches = container.querySelectorAll('.asset-table tbody tr');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('Real Access')) {
        foundIt = true;
        expect(rowContent).toContain('Kurosaki, Ichigo'); // confirm assigned person is displayed
        expect(rowContent).toContain('1'); // confirm number of assignments is displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of accesses', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake accesses
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeAccesses)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <AccessContainer />
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });
    const matches = container.querySelectorAll('.asset-table tbody tr');

    expect(matches.length).toBe(2);
  });

  it('Shows access details', async () => {
    await act(async () => {
      // spy on our context's fetch handler to return fake access
      vi.spyOn(contextObject, 'fetch').mockImplementation(() =>
        Promise.resolve(fakeAccesses)
      );

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter initialEntries={['/caes-cru/access/details/15']}>
            {routes}
          </MemoryRouter>
        </Context.Provider>,
        { container }
      );
    });

    // should show access contact info
    const accessContent = within(container).getByRole('heading', {
      name: /Real Access/
    });
    expect(accessContent).toBeInTheDocument();
    expect(
      within(container).getByRole('button', { name: 'Edit Access' })
    ).toBeInTheDocument();
    expect(
      within(container).getByRole('button', { name: 'Delete Access' })
    ).toBeInTheDocument();
    expect(container.querySelector('.access-color')).not.toHaveClass('card');
  });
});
