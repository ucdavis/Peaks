import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import PeopleContainer from '../People/PeopleContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { fakePeople } from '../specs/TestData';

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

describe('People Container', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

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
          <PeopleContainer
            history={mockRouter}
            match={mockRouterMatch}
            location={mockRouter}
          />
        </Context.Provider>,
        container
      );
    });

    // grab out the first row and make sure it contains the test email address
    const firstRowContent = container.querySelector('.rt-tr-group').textContent;

    expect(firstRowContent).toContain('srkirkland@ucdavis.edu'); // confirm person is displayed
    expect(firstRowContent).toContain('1110'); // confirm counts are displayed
  });
});
