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
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    const headerRecord = container.querySelector('div');

    const consoleSpy = jest.spyOn(console, 'log');

    console.log(headerRecord);
  
    expect(consoleSpy).toHaveBeenCalledWith('hello');

    // expect(headerRecord).toBe(' Key Name 🔼Key CodeSerials SpacesActions');
  });
});
