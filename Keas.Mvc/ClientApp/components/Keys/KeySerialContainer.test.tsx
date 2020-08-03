import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import KeySerialContainer from '../Keys/KeySerialContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakeKeySerials } from '../specs/mockData/KeySerial';

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
let selectedKey = {
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
  unmountComponentAtNode(container);
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
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeKeySerials));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <KeySerialContainer
            selectedKey={selectedKey}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = document.querySelector('.table-row').textContent;

    expect(headerRecord).toBe(
      ' Key Code and SN 🔼Status 🔼AssignmentExpirationActions'
    );
  });

  it('Shows add button', async () => {
    // await act to make sure pending Promises complete before moving on
    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeKeySerials));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <KeySerialContainer
            selectedKey={selectedKey}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
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
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeKeySerials));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <KeySerialContainer
            selectedKey={selectedKey}
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
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeKeySerials));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <KeySerialContainer
            selectedKey={selectedKey}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });
    const matches = container.querySelectorAll('.rt-tr-group');

    expect(matches.length).toBe(3);
  });

  it('Shows key serial details', async () => {
    mockRouter.push = () => {
      console.log('Nothing');
    };
    mockRouterMatch.params = {
      action: 'details',
      assetType: 'keyserials',
      id: 40 // test key serial id
    };

    await act(async () => {
      // spy on our context's fetch handler to return fake key serials
      jest
        .spyOn(contextObject, 'fetch')
        .mockImplementation(() => Promise.resolve(fakeKeySerials));

      // important to add the context provider here since it includes permissions and fetch info
      render(
        <Context.Provider value={contextObject}>
          <KeySerialContainer
            selectedKey={selectedKey}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const detailButton = container.querySelectorAll('button')[1];
    detailButton.click();

    const details = document.querySelectorAll('input');

    expect(details[3].value).toContain('Cereal'); // confirm key name is displayed
    expect(details[4].value).toContain('ADD'); // confirm key code is displayed
    expect(details[5].value).toContain('2'); // confirm key serial number is displayed
  });
});
