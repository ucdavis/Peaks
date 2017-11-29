import * as React from "react";
import PropTypes from "prop-types";

import { AppContext } from '../Types';
import Person from "./Person";

export default class PersonContainer extends React.Component<{}, {}> {
  static contextTypes = {
    person: PropTypes.object
  };
  context: AppContext;
  public render() {
    const { person } = this.context;
    if (person.id === 0) {
      return <div>Create a new person</div>;
    }

    return <Person person={person} />;
  }
}
