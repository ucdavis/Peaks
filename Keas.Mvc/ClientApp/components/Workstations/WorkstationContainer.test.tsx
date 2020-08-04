import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import WorkstationContainer from '../Workstations/WorkstationContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakeWorkstations } from '../specs/mockData/Workstation';
import { ISpace } from 'ClientApp/models/Spaces';

// mock all route elements
let mockRouter: any = {};
let mockRouterMatch: any = {
  params: {}
};

jest.mock('../History/HistoryContainer', () => {
  return {
    default: () => {
      return <div id='HistoryContainer'>HistoryContainer</div>;
    }
  };
});

let container: Element = null;
let selectedSpace: ISpace = {
  id: 3535,
  deptName: "Dean's Office, CA&ES",
  bldgName: 'Mrak Hall',
  roomKey: 'DV-01-00007674',
  roomNumber: '0003',
  roomName: 'Storage',
  floorName: 'Basement Floor',
  roomCategoryName: 'Assignable Area',
  orgId: 'AADM',
  sqFt: '320'
};

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

describe('Workstation Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake workstations
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeWorkstations));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <WorkstationContainer
            space={selectedSpace}
            tags={null}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('thead').textContent;

    expect(headerRecord).toBe('NameSpaceAssigned ToExpirationActions');
  });

  it('Shows add button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake key workstations
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeWorkstations));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <WorkstationContainer
            space={selectedSpace}
            tags={null}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.card-header-spaces')
      .textContent;
    expect(headerRecord).toContain('Add Workstation');
  });

  it('Shows workstation list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake workstations
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeWorkstations));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <WorkstationContainer
            space={selectedSpace}
            tags={null}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const matches = container.querySelectorAll('tr');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('Desk0038')) {
        foundIt = true;
        expect(rowContent).toContain('Mrak Hall'); // confirm building name is displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of workstation', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake workstations
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeWorkstations));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <WorkstationContainer
            space={selectedSpace}
            tags={null}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });
    const matches = container.querySelectorAll('tbody tr');

    expect(matches.length).toBe(4);
  });

  it('Shows workstation details', async () => {
    mockRouter.push = () => {
      console.log('Nothing');
    };
    mockRouterMatch.params = {
      action: 'details',
      assetType: 'workstations',
      id: 17 // test workstation id
    };

    await act(async () => {
      // spy on our context's fetch handler to return fake workstations
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeWorkstations));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <WorkstationContainer
            space={selectedSpace}
            tags={null}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const detailButton = document.querySelectorAll('button')[1];
    detailButton.click();

    const details = document.querySelectorAll('input');

    expect(details[0].value).toContain('Desk'); // confirm name is displayed
    expect(details[1].value).toContain('0038 Mrak Hall'); // confirm room is displayed
  });
});
