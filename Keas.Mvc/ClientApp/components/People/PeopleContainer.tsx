import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPerson } from "../../Types";

export default class PeopleContainer extends React.Component<{}, {}> {
  public static contextTypes = {
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  public render() {
    return (
      <div>
        <h2>
          Eventually this will display everyone in team {this.context.team.name}
        </h2>
        <a href="/CAESDO/person/details/1">Details for Scott</a>
      </div>
    );
  }
}
