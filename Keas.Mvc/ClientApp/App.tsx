import PropTypes from "prop-types";
import * as React from "react";

import { IPerson, ITeam } from "./Types";
import { createFetch } from "./util/api";

import { History } from "history";

interface IProps {
  person: IPerson;
  team: ITeam;
}

// Provider
export default class App extends React.Component<IProps, {}> {
  public static childContextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    team: PropTypes.object
  };
  public getChildContext() {
    // define context here
    return {
      fetch: createFetch(),
      person: this.props.person,
      team: this.props.team
    };
  }
  public render() {
    return <div>{this.props.children}</div>;
  }
}
