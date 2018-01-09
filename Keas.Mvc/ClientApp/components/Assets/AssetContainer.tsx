import PropTypes from "prop-types";
import * as React from "react";

import { AppContext } from "../../Types";

export default class AssetContainer extends React.Component<{}, {}> {
  public static contextTypes = {
    team: PropTypes.object
  };
  public context: AppContext;
  public render() {
    const team = this.context.team;

    return <div>{team.name}</div>;
  }
}
