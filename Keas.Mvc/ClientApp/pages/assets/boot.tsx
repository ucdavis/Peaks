import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { BrowserRouter } from "react-router-dom";

import App from "../../App";
import * as RoutesModule from "./routes";

const routes = RoutesModule.routes;

declare var window: any;

function renderApp() {
  const team = window.App.teamData;
  const permissons = window.App.permissionsData;
  const antiForgeryToken = window.App.antiForgeryToken;

  // This code starts up the React app when it runs in a browser. It sets up the routing
  // configuration and injects the app into a DOM element.
  ReactDOM.render(
    <AppContainer>
      <App team={team} permissions={permissons} antiForgeryToken={antiForgeryToken}>
        <BrowserRouter children={routes} />
      </App>
    </AppContainer>,
    document.getElementById("react-app")
  );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
  module.hot.accept("./AssetContainer", () => {
    renderApp();
  });
}
