import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { createFetch } from './util/api';

import * as RoutesModule from './pages/assets/routes';

import 'react-toastify/dist/ReactToastify.css';

import { Context } from './Context';

const routes = RoutesModule.routes;

declare let window: any;

export function renderApp(container: HTMLElement) {
  if (window.App === undefined) {
    // set defaults if we aren't using a page that loads client-side vars
    window.App = {
      teamData: {},
      tags: [],
      permissionsData: [],
      antiForgeryToken: ''
    };
  }

  const team = window.App.teamData;
  const tags = window.App.tags;
  const permissions = window.App.permissionsData;
  const antiForgeryToken = window.App.antiForgeryToken;

  const contextObject = {
    fetch: createFetch(antiForgeryToken),
    permissions,
    team,
    tags
  };

  // This code starts up the React app when it runs in a browser. It sets up the routing
  // configuration and injects the app into a DOM element.
  const root = createRoot(container);
  root.render(
    <Context.Provider value={contextObject}>
      <BrowserRouter>
        <Switch>
          {/* Match any server-side routes and send empty content to let MVC return the view details */}
          {routes}
        </Switch>
      </BrowserRouter>
      <ToastContainer
        position='top-center'
        theme='colored'
        icon={false}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        draggable={true}
        pauseOnHover={true}
      />
    </Context.Provider>
  );
  return root;
}
