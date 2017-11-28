import "./css/site.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import PersonContainer from './components/PersonContainer';

declare var window: any;

function renderApp() {
  const person = window.App.personData;

  // This code starts up the React app when it runs in a browser. It sets up the routing
  // configuration and injects the app into a DOM element.
  ReactDOM.render(
    <AppContainer>
      <PersonContainer person={person} />
    </AppContainer>,
    document.getElementById("react-app")
  );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
  module.hot.accept("./components/PersonContainer", () => {
    renderApp();
  });
}
