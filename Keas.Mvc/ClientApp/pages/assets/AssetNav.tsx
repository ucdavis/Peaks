import PropTypes from "prop-types";
import * as React from "react";
import { match } from "react-router";
import { Link, NavLink } from "react-router-dom";

export default class AssetNav extends React.Component<{}, {}> {
  public render() {
    return (
      <div>
        <ul className="react-tabs">
          <li className="tab-item">
            <NavLink
              to="/CAESDO/keys"
              className="tab-link"
              activeClassName="active"
            >
              Keys
            </NavLink>
          </li>
          <li className="tab-item">
            <NavLink
              to="/CAESDO/equipment"
              className="tab-link"
              activeClassName="active"
            >
              Equipment
            </NavLink>
          </li>
          <li className="tab-item">
              <NavLink
                  to="/CAESDO/access"
                  className="tab-link"
                  activeClassName="active"
              >
                  Access
            </NavLink>
          </li>
          <li className="tab-item">
              <NavLink
                  to="/CAESDO/spaces"
                  className="tab-link"
                  activeClassName="active"
              >
                  Spaces
            </NavLink>
          </li>
          <li className="tab-item">
            <NavLink
              to="/CAESDO/people"
              className="tab-link"
              activeClassName="active"
            >
              People
            </NavLink>
          </li>
          <li className="tab-item">
            <NavLink
              to="/CAESDO/person"
              className="tab-link disabled"
              onClick={e => e.preventDefault()}
            >
              Person
            </NavLink>
          </li>
        </ul>
        <div>{this.props.children}</div>
      </div>
    );
  }
}
