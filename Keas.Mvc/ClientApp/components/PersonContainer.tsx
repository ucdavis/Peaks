import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPerson } from "../Types";
import Person from "./Person";

export default class PersonContainer extends React.Component<{}, {}> {
  public static contextTypes = {
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  public render() {
    const personId = this.context.router.route.match.params.id;

    // go get the person from javascript
    const person: IPerson = {
      id: 1,
      teamId: this.context.team.id,
      user: {
        email: "srkirkland@example.com",
        name: "Scott",
      },
      userid: 12
    };

    // const { person } = this.context;
    if (!person || person.id === 0) {
      return <div>Create a new person</div>;
    }

    return <Person person={person} />;
  }
}
