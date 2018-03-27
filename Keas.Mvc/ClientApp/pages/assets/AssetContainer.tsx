import PropTypes from "prop-types";
import * as React from "react";
import { match } from "react-router";

import { AppContext, IRouteProps } from "../../Types";
import AssetDisplay from "./AssetDisplay";

interface IProps {
  match: match<IRouteProps>;
}

export default class AssetContainer extends React.Component<IProps, {}> {
  public static contextTypes = {
    router: PropTypes.object,
    team: PropTypes.object,
  };
  public context: AppContext;
  public render() {
    const team = this.context.team;
    const selectedId = parseInt(this.props.match.params.id, 10);
    return (
      <AssetDisplay
        type={this.props.match.params.assetType}
        onTypeChange={this.onTypeChange}
      />
    );
  }
  private onTypeChange = type => {
    this.context.router.history.push(`/${this.context.team.name}/asset/${type}`);
  };
}
