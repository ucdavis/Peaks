import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Context } from '../../Context';
import { PermissionsUtil } from '../../util/permissions';

const tabClassName = 'flex-1 shrink-0 whitespace-nowrap border-b-4 border-transparent px-3 py-5 text-center font-semibold text-base-content transition-colors first:rounded-tl-sm last:rounded-tr-sm hover:text-[color-mix(in_oklab,var(--asset-color)_80%,black)] [&.active]:border-[var(--asset-color)] [&.active]:bg-[color-mix(in_oklab,var(--asset-color)_10%,transparent)] [&.active]:text-[var(--asset-color)]';

export default class AssetNav extends React.Component<
  React.PropsWithChildren<{}>
> {
  declare context: React.ContextType<typeof Context>;

  public render() {
    return (
      <div>
        <nav aria-label='Team assets' className='mb-4 flex overflow-x-auto rounded-sm bg-base-100 shadow-sm'>
          {PermissionsUtil.canViewPeople(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/people`}
              className={`${tabClassName} tab-people`}
              activeClassName='active'
            >
              People
            </NavLink>
          )}
          {PermissionsUtil.canViewEquipment(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/equipment`}
              className={`${tabClassName} tab-equipment`}
              activeClassName='active'
            >
              Equipment
            </NavLink>
          )}
          {PermissionsUtil.canViewAccess(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/access`}
              className={`${tabClassName} tab-access`}
              activeClassName='active'
            >
              Access
            </NavLink>
          )}
          {PermissionsUtil.canViewKeys(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/keys`}
              className={`${tabClassName} tab-keys`}
              activeClassName='active'
            >
              Keys
            </NavLink>
          )}
          {PermissionsUtil.canViewSpaces(this.context.permissions) && (
            <NavLink
              to={`/${this.context.team.slug}/spaces`}
              className={`${tabClassName} tab-spaces`}
              activeClassName='active'
            >
              Spaces
            </NavLink>
          )}
        </nav>

        <div>{this.props.children}</div>
      </div>
    );
  }
}

AssetNav.contextType = Context;
