import PropTypes from "prop-types";
import * as React from "react";
import { match } from "react-router";
import { Link, NavLink } from "react-router-dom";

export default class AssetNav extends React.Component<{}, {}> {
  public render() {
    return (
      <div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink
              to="/CAESDO/keys"
              className="nav-link"
              activeClassName="active"
            >
              Keys
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/CAESDO/equipment"
              className="nav-link"
              activeClassName="active"
            >
              Equipment
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/CAESDO/people"
              className="nav-link"
              activeClassName="active"
            >
              People
            </NavLink>
          </li>
        </ul>
        <div>{this.props.children}</div>
      </div>
    );
  }
}
