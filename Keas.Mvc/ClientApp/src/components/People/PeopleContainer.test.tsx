import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { MemoryRouter } from 'react-router';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakePeople } from '../specs/TestData';
import { routes } from '../../pages/assets/routes';
import PeopleContainer from '../People/PeopleContainer';

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

jest.mock('../Equipment/EquipmentContainer', () => {
  return {
    default: () => {
      return <div id='EquipmentContainer'>EquipmentContainer</div>;
    }
  };
});

jest.mock('../Keys/KeySerialContainer', () => {
  return {
    default: () => {
      return <div id='KeySerialContainer'>KeySerialContainer</div>;
    }
  };
});

jest.mock('../Workstations/WorkstationContainer', () => {
  return {
    default: () => {
      return <div id='WorkstationContainer'>WorkstationContainer</div>;
    }
  };
});

jest.mock('../History/HistoryContainer', () => {
  return {
    default: () => {
      return <div id='HistoryContainer'>HistoryContainer</div>;
    }
  };
});

jest.mock('../Documents/DocumentsContainer', () => {
  return {
    default: () => {
      return <div id='DocumentsContainer'>DocumentsContainer</div>;
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

describe('People Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake people
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakePeople));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <PeopleContainer />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.table-row').textContent;
    expect(headerRecord).toBe(
      ' NameEmailSupervisorKeysEquipmentAccessWorkstations'
    );
  });

  it('Shows add button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake people
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakePeople));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <PeopleContainer />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.card-header-people')
      .textContent;
    expect(headerRecord).toContain('Add Person');
  });

  it('Shows people list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake people
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakePeople));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <PeopleContainer />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    //Data is sorted by last name
    const matches = container.querySelectorAll('.rt-tr-group');

    let foundIt = false;
    matches.forEach(function (match) {
      const rowContent = match.textContent;
      if (rowContent.includes('chuck@testpilot.gov')) {
        foundIt = true;
        expect(rowContent).toContain('chuck@testpilot.gov'); // confirm person is displayed
        expect(rowContent).toContain('1110'); // confirm counts are displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

  it('Shows correct number of persons', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake people
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakePeople));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter>
            <PeopleContainer />
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });
    const matches = container.querySelectorAll('.rt-tr-group');

    expect(matches.length).toBe(4); //Should this be 3? Or is the inactive ignored and only used when queried by the api?
  });

  it('Shows person details', async () => {
    await act(async () => {
      // spy on our context's fetch handler to return fake people
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakePeople));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <MemoryRouter initialEntries={['/caes-cru/people/details/123']}>
            {routes}
          </MemoryRouter>
        </Context.Provider>,
        container
      );
    });

    // should show person contact info
    const personContent = container.querySelector('.person-col').textContent;

    expect(personContent).toContain('chuck@testpilot.gov');

    // should show the access container
    const accessAssignmentContainerContent = container.querySelector(
      '#AccessAssignmentContainer'
    ).textContent;

    expect(accessAssignmentContainerContent).toBe('AccessAssignmentContainer');
  });
});
