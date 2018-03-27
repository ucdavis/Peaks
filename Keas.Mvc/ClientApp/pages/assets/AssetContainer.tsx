import PropTypes from "prop-types";
import * as React from "react";

import { AppContext } from "../../Types";
import AssetDisplay from "./AssetDisplay";

interface IProps {
  match: object;
  history: object;
}

export default class AssetContainer extends React.Component<IProps, {}> {
  public static contextTypes = {
    team: PropTypes.object
  };
  public context: AppContext;
  public render() {
    const team = this.context.team;
    const selectedId = parseInt(this.props.match.params.id);
    return (
      <AssetDisplay
        action={this.props.match.params.action}
        team={team}
        type={this.props.match.params.assetType}
        selectedId={selectedId}
        onTypeChange={this.onTypeChange}
      />
    );
  }
  private onTypeChange = type => {
    this.props.history.push(`/${this.context.team.name}/asset/${type}`);
  };
}
