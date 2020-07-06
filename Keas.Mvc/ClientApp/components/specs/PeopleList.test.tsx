import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import PeopleContainer from '../People/PeopleContainer';
import { act } from 'react-dom/test-utils';
import { Context } from '../../Context';

// mock all route elements
let mockRouter: any = {};
let mockRouterMatch: any = {
  params: {
    containerAction: 'People',
    containerId: '',
    assetType: '',
    action: 'People',
    id: ''
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

describe('Link', () => {
  const contextObject = {
    fetch: (url: any, index: any) => {},
    permissions: ['DepartmentalAdmin', 'Admin'],
    team: { id: 1, name: 'Team', slug: 'team' },
    tags: []
  };

  it('Renders view name', () => {
    act(() => {
      contextObject.fetch = (url, init) => {
        return Promise.resolve([]);
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

    console.log(container.textContent);

    expect(container.querySelector('.ReactTable')).toBeDefined();
  });
});
