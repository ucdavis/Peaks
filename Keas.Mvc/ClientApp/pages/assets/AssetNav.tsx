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
              className="tab-link"
              activeClassName="active"
            >
              Keys
            </NavLink>


            <NavLink
              to="/CAESDO/equipment"
              className="tab-link"
              activeClassName="active"
            >
              Equipment
            </NavLink>


              <NavLink
                  to="/CAESDO/access"
                  className="tab-link"
                  activeClassName="active"
              >
                  Access
            </NavLink>


              <NavLink
                  to="/CAESDO/spaces"
                  className="tab-link"
                  activeClassName="active"
              >
                  Spaces
            </NavLink>


            <NavLink
              to="/CAESDO/people"
              className="tab-link"
              activeClassName="active"
            >
              People
            </NavLink>


            <NavLink
              to="/CAESDO/person"
              className="tab-link disabled"
              onClick={e => e.preventDefault()}
            >
              Person
            </NavLink>
          </div>

        <div>{this.props.children}</div>
      </div>
    );
  }
}
