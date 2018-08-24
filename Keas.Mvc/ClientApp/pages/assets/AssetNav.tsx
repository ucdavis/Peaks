import PropTypes from "prop-types";
import * as React from "react";
import { match } from "react-router";
import { Link, NavLink } from "react-router-dom";

export default class AssetNav extends React.Component<{}, {}> {
  public render() {
    return (

      <div>

        <div className="react-tabs">
            <NavLink
              to="/CAESDO/keys"
              className="tab-link tab-keys"
              activeClassName="active"
            >
              Keys
            </NavLink>


            <NavLink
              to="/CAESDO/equipment"
              className="tab-link tab-equipment"
              activeClassName="active"
            >
              Equipment
            </NavLink>


              <NavLink
                  to="/CAESDO/access"
                  className="tab-link tab-access"
                  activeClassName="active"
              >
                  Access
            </NavLink>


              <NavLink
                  to="/CAESDO/spaces"
                  className="tab-link tab-spaces"
                  activeClassName="active"
              >
                  Spaces
            </NavLink>


            <NavLink
              to="/CAESDO/people"
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
