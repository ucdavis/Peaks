import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import PeopleContainer from '../People/PeopleContainer';
import { act } from 'react-dom/test-utils';

// mock all route elements
let mockRouter: any = {};

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
  it('Renders view name', () => {
    act(() => {
      render(
        <PeopleContainer
          history={mockRouter}
          match={mockRouter}
          location={mockRouter}
        />,
        container
      );
    });

    expect(container.querySelector(".ReactTable")).toBeDefined();
  });
});
