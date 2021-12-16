import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { createFetch } from './util/api';

import * as RoutesModule from './pages/assets/routes';

import 'react-toastify/dist/ReactToastify.css';
import './sass/site.scss';

import { Context } from './Context';

const routes = RoutesModule.routes;

declare let window: any;

function renderApp() {
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
  ReactDOM.render(
    <Context.Provider value={contextObject}>
      <BrowserRouter>
        <Switch>
          {/* Match any server-side routes and send empty content to let MVC return the view details */}
          {/* TODO: find paths to send empty for, or perhaps just use inverse of other routes */}
          <Route
            path='/(account|rate|permissions|crop|home|system|help)'
            component={() => <></>}
          />
          {routes}
          <Route path='*'>Page Not found (404 style)</Route>
        </Switch>
      </BrowserRouter>
      <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        draggable={true}
        pauseOnHover={true}
      />
    </Context.Provider>,
    document.getElementById('root')
  );
}

renderApp();
