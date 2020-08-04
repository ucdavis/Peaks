import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import WorkstationContainer from '../Workstations/WorkstationContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakeWorkstations } from '../specs/mockData/Workstation';

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
            tags={null}
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = document.querySelector('div');

    const consoleSpy = jest.spyOn(console, 'log');

    console.log(headerRecord);
  
    expect(consoleSpy).toHaveBeenCalledWith('hello');

    expect(headerRecord).toBe(
      ' Key Code and SN 🔼Status 🔼AssignmentExpirationActions'
    );
  });
});
