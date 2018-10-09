import PropTypes from "prop-types";
import * as React from "react";
import { match } from "react-router";
import { Link, NavLink } from "react-router-dom";

export default class AssetNav extends React.Component<{}, {}> {
    public static contextTypes = {
      team: PropTypes.object
    };
  public render() {
    return (

      <div>
        <div className="react-tabs">
          <NavLink
            to={`/${this.context.team.slug}/keys`}
            className="tab-link tab-keys"
            activeClassName="active"
          >
            Keys
          </NavLink>
          <NavLink
            to={`/${this.context.team.slug}/equipment`}
            className="tab-link tab-equipment"
            activeClassName="active"
          >
            Equipment
          </NavLink>
          <NavLink
            to={`/${this.context.team.slug}/access`}
            className="tab-link tab-access"
            activeClassName="active"
          >
            Access
          </NavLink>
          <NavLink
            to={`/${this.context.team.slug}/spaces`}
            className="tab-link tab-spaces"
            activeClassName="active"
          >
            Spaces
          </NavLink>
          <NavLink
            to={`/${this.context.team.slug}/people`}
            className="tab-link tab-people"
            activeClassName="active"
          >
            People
          </NavLink>
        </div>

        <div>{this.props.children}</div>
      </div>
    );
  }
}
