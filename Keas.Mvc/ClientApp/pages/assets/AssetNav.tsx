import * as PropTypes from 'prop-types';
import * as React from "react";
import { NavLink } from "react-router-dom";
import { PermissionsUtil } from "../../util/permissions";

export default class AssetNav extends React.Component<{}, {}> {
  public static contextTypes = {
    permissions: PropTypes.array,
    team: PropTypes.object
  };
  public render() {
    return (

      <div>
        <div className="react-tabs">
          {PermissionsUtil.canViewPeople(this.context.permissions) &&
            <NavLink
              to={`/${this.context.team.slug}/people`}
              className="tab-link tab-people"
              activeClassName="active"
            >
              People
        </NavLink>}
        {PermissionsUtil.canViewEquipment(this.context.permissions) && 
          <NavLink
            to={`/${this.context.team.slug}/equipment`}
            className="tab-link tab-equipment"
            activeClassName="active"
          >
            Equipment
          </NavLink>}
          {PermissionsUtil.canViewAccess(this.context.permissions) &&
            <NavLink
              to={`/${this.context.team.slug}/access`}
              className="tab-link tab-access"
              activeClassName="active"
            >
              Access
          </NavLink>}
          {PermissionsUtil.canViewKeys(this.context.permissions) && 
          <NavLink
            to={`/${this.context.team.slug}/keys`}
            className="tab-link tab-keys"
            activeClassName="active"
          >
            Keys
          </NavLink> }
          {PermissionsUtil.canViewSpaces(this.context.permissions) && 
          <NavLink
            to={`/${this.context.team.slug}/spaces`}
            className="tab-link tab-spaces"
            activeClassName="active"
          >
            Spaces
          </NavLink>}
        </div>

        <div>{this.props.children}</div>
      </div>
    );
  }
}
