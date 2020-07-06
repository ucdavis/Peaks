import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { createFetch } from '../../util/api';

import * as RoutesModule from './routes';

import 'react-toastify/dist/ReactToastify.css';
import { Context } from '../../Context';

const routes = RoutesModule.routes;

declare var window: any;

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
    <AppContainer>
      <Context.Provider value={contextObject}>
        <BrowserRouter children={routes} />
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
      </Context.Provider>
    </AppContainer>,
    document.getElementById('react-app')
  );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
  module.hot.accept(() => {
    renderApp();
  });
}
