import "./css/site.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

declare var window: any;

function renderApp() {

  // This code starts up the React app when it runs in a browser. It sets up the routing
  // configuration and injects the app into a DOM element.
  ReactDOM.render(
      <App />,
    document.getElementById("react-app")
  );
}

renderApp();

// Allow Hot Module Replacement
{/* if (module.hot) {
  module.hot.accept("./components/PersonContainer", () => {
    renderApp();
  });
} */}
