import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPerson } from "../../Types";
import PeopleListItem from "./PeopleListItem";

interface IState {
    members: IPerson[];
}
export default class PeopleContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
      super(props);

      this.state = {
          members: []
      };
  }

  public async componentDidMount() {
      const members = await this.context.fetch(`/api/${this.context.team.name}/people/list/${this.context.team.id}`);
      this.setState({ members });
  }
  public render() {
      const memberList = this.state.members.map(x => (
          <PeopleListItem key={x.id} person={x} teamName={this.context.team.name} />));
    return (
      <div>
        <h2>
          Eventually this will display everyone in team {this.context.team.name}
        </h2>
        {memberList}
      </div>
    );
  }
}
