import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import SpacesContainer from './SpacesContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakeSpaces } from '../specs/mockData/Space';

// mock all route elements
let mockRouter: any = {};
let mockRouterMatch: any = {
  params: {}
};

let container: Element = null;

// mock out the sub containers, at least for now
jest.mock('../People/PeopleContainer', () => {
  return {
    default: () => {
      return <div id='PeopleContainer'>PeopleContainer</div>;
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

describe('Space Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Shows Header Record', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake spaces
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeSpaces));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <SpacesContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('.table-row').textContent;
    expect(headerRecord).toBe('DetailsRoomRoom NameKeysEquipmentWorkstations ');
  });

  it('Shows spaces list', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake spaces
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeSpaces));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <SpacesContainer
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
      if (rowContent.includes('IPO - Open Office 3')) {
        foundIt = true;
        expect(rowContent).toContain('Temporary Building 200'); // confirm room is displayed
        expect(rowContent).toContain('5'); // confirm number of keys are displayed
        expect(rowContent).toContain('1'); // confirm number of equipment are displayed
        expect(rowContent).toContain('3 / 5'); // confirm workstations are displayed
      }
    });

    expect(foundIt).toBeTruthy();
  });

    it('Shows correct number of spaces', async () => {
      // await act to make sure pending Promises complete before moving on
      await act(async () => {
        // spy on our context's fetch handler to return fake spaces
        jest
          .spyOn(contextObject, 'fetch')
          .mockImplementation(() => Promise.resolve(fakeSpaces));

        // important to add the context provider here since it includes permissions and fetch info
        render(
          <Context.Provider value={contextObject}>
            <SpacesContainer
              history={mockRouter}
              match={mockRouterMatch}
              location={mockRouter}
            />
          </Context.Provider>,
          container
        );
      });
      const matches = container.querySelectorAll('.rt-tr-group');

      expect(matches.length).toBe(4);
    });
});
