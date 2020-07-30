import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import AccessContainer from '../Access/AccessContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakeAccesses } from '../specs/mockData/Access';

// mock all route elements
let mockRouter: any = {};
let mockRouterMatch: any = {
  params: {}
};

let container: Element = null;

// mock out the sub containers, at least for now
jest.mock('../Access/AccessAssignmentContainer', () => {
  return {
    default: () => {
      return (
        <div id='AccessAssignmentContainer'>AccessAssignmentContainer</div>
      );
    }
  };
});

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
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
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeAccesses));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <AccessContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.table-row').textContent;
    expect(headerRecord).toBe(
      ' Name 🔼Number of AssignmentsAssigned ToExpirationActions'
    );
  });

  it('Shows Add Button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake accesses
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeAccesses));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <AccessContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
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
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeAccesses));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <AccessContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const matches = container.querySelectorAll('.rt-tr-group');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('Real Access')) {
        foundIt = true;
        expect(rowContent).toContain('Ichigo Kurosaki'); // confirm assigned person is displayed
        expect(rowContent).toContain(1); // confirm number of assignments is displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of accesses', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake accesses
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeAccesses));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <AccessContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });
    const matches = container.querySelectorAll('.rt-tr-group');

    expect(matches.length).toBe(2);
  });

  it('Shows access details', async () => {
    mockRouterMatch.params = {
      containerAction: 'details',
      containerId: 15 // test accessid
    };

    await act(async () => {
      // spy on our context's fetch handler to return fake access
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeAccesses));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <AccessContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    // should show access contact info
    const accessContent = container.querySelector('.card-content h2')
      .textContent;
    const accessOptions = container.querySelector('.card-content').textContent;

    expect(accessContent).toContain('Real Access'); // confirm name is displayed
    expect(accessOptions).toContain('Edit Access'); // confirm edit option is displayed
    expect(accessOptions).toContain('Delete Access'); // confirm delete option is displayed
  });
});
