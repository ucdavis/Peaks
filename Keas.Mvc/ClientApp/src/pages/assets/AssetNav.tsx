import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Context } from '../../Context';
import { PermissionsUtil } from '../../util/permissions';

export default class AssetNav extends React.Component<
  React.PropsWithChildren<{}>
> {
  declare context: React.ContextType<typeof Context>;

  public render() {
    return (
      <div>
        <div className='react-tabs'>
          {PermissionsUtil.canViewPeople(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/people`}
              className='tab-link font-semibold tab-people'
              activeClassName='active'
            >
              People
            </NavLink>
          )}
          {PermissionsUtil.canViewEquipment(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/equipment`}
              className='tab-link font-semibold tab-equipment'
              activeClassName='active'
            >
              Equipment
            </NavLink>
          )}
          {PermissionsUtil.canViewAccess(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/access`}
              className='tab-link font-semibold tab-access'
              activeClassName='active'
            >
              Access
            </NavLink>
          )}
          {PermissionsUtil.canViewKeys(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/keys`}
              className='tab-link font-semibold tab-keys'
              activeClassName='active'
            >
              Keys
            </NavLink>
          )}
          {PermissionsUtil.canViewSpaces(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/spaces`}
              className='tab-link font-semibold tab-spaces'
              activeClassName='active'
            >
              Spaces
            </NavLink>
          )}
        </div>

        <div>{this.props.children}</div>
      </div>
    );
  }
}

AssetNav.contextType = Context;
