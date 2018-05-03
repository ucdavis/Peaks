import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPerson } from "../Types";
import Person from "./Person";

interface IState {
    person: IPerson;
}

export default class PersonContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
      super(props);
      this.state = {
          person: null,
      };
  }

  public async componentDidMount() {
      const person = await this.context.fetch(`/api/${this.context.team.name}/people/getPerson?personId=${this.context.router.route.match.params.personId}&teamId=${this.context.team.id}`);
      this.setState({ person });
  }

  public render() {
    //const personId = this.context.router.route.match.params.id;

    // TODO: go get the person from javascript
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
    if (!this.state.person || this.state.person.id === 0) {
      return <div>Create a new person</div>;
    }

    return <Person person={this.state.person} />;
  }
}
