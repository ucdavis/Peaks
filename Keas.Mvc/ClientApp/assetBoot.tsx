import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import App from "./App";
import AssetContainer from "./components/Assets/AssetContainer";
import "./css/site.css";

declare var window: any;

function renderApp() {
  const person = null;
  const team = window.App.teamData;

  // This code starts up the React app when it runs in a browser. It sets up the routing
  // configuration and injects the app into a DOM element.
  ReactDOM.render(
    <AppContainer>
      <App person={person} team={team}>
        <AssetContainer />
      </App>
    </AppContainer>,
    document.getElementById("react-app")
  );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
  module.hot.accept("./components/AssetContainer", () => {
    renderApp();
  });
}
