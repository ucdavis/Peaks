import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { MemoryRouter } from 'react-router';

import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakeEquipment } from '../specs/mockData/Equipment';
import EquipmentContainer from '../Equipment/EquipmentContainer';

// mock all route elements
const mockRouter: any = {};
const mockRouterMatch: any = {
  params: {}
};

let container: Element = null;

jest.mock('../History/HistoryContainer', () => {
  return {
    default: () => {
      return <div id='HistoryContainer'>HistoryContainer</div>;
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

describe('Equipment Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeEquipment));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer
              history={mockRouter}
              match={mockRouterMatch}
              location={mockRouter}
            />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.table-row').textContent;
    expect(headerRecord).toBe(' Serial NumberNameAssigned ToExpirationActions');
  });

  it('Shows Add Button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeEquipment));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer
              history={mockRouter}
              match={mockRouterMatch}
              location={mockRouter}
            />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.card-header-equipment')
      .textContent;
    expect(headerRecord).toContain('Add Equipment');
  });

  it('Shows equipment list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeEquipment));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer
              history={mockRouter}
              match={mockRouterMatch}
              location={mockRouter}
            />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    const matches = container.querySelectorAll('.rt-tr-group');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('Dell Desktop')) {
        foundIt = true;
        expect(rowContent).toContain('Eren Yeager'); // confirm assigned person is displayed
        expect(rowContent).toContain('4DVNPD2'); // confirm serial number are displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of equipment', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeEquipment));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer
              history={mockRouter}
              match={mockRouterMatch}
              location={mockRouter}
            />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });
    const matches = container.querySelectorAll('.rt-tr-group');

    expect(matches.length).toBe(4); //Should this be 3? Or is the inactive ignored and only used when queried by the api?
  });

  it('Shows equipment details', async () => {
    mockRouter.push = () => {
      console.log('Nothing');
    };
    mockRouterMatch.params = {
      action: 'details',
      id: 24 // test equipmentid
    };

    await act(async () => {
      // spy on our context's fetch handler to return fake equipment
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeEquipment));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <EquipmentContainer
              history={mockRouter}
              match={mockRouterMatch}
              location={mockRouter}
            />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    const detailButton = container.querySelectorAll('button')[1];
    detailButton.click();
    // const doc = document.querySelectorAll('div');

    // const consoleSpy = jest.spyOn(console, 'log');
    // console.log(doc[]);

    // expect(consoleSpy).toHaveBeenCalledWith('hello');

    const details = document.querySelector('.modal-content').textContent;

    expect(details).toContain('Dell Desktop'); // confirm name is displayed
    expect(details).toContain('Monitor'); // confirm notes is displayed
  });
});
