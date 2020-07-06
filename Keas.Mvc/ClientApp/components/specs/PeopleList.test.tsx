import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import PeopleContainer from '../People/PeopleContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';
import { IPersonInfo } from 'ClientApp/models/People';

// mock all route elements
let mockRouter: any = {};
let mockRouterMatch: any = {
  params: {
  }
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
    await act(async () => {
      contextObject.fetch = (url, init) => {
        const fakePeople: IPersonInfo[] = [
          {
            person: {
              id: 1247,
              active: true,
              teamId: 10,
              user: null,
              userId: 'postit',
              firstName: 'Scott',
              lastName: 'Kirkland',
              name: 'Scott Kirkland',
              email: 'srkirkland@ucdavis.edu',
              tags: null,
              title: null,
              homePhone: null,
              teamPhone: null,
              supervisorId: null,
              supervisor: null,
              startDate: null,
              endDate: null,
              category: null,
              notes: null,
              isSupervisor: true
            },
            id: 1247,
            equipmentCount: 1,
            accessCount: 1,
            keyCount: 1,
            workstationCount: 0
          }
        ];
        return Promise.resolve(fakePeople);
      };

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
