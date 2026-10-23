import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';

interface IProps {
  actions: IAction[];
  className?: string; // for spaces/details/keys action buttons
}

export interface IAction {
  title: string;
  onClick: () => void;
}

const ListActionsDropdown = (props: IProps) => {
  const [isOpen, toggle] = useState(false);
  const { actions } = props;

  if (actions.length === 0) return null;

  return (
    <Dropdown
      direction='down'
      className='inline-flex'
      isOpen={isOpen}
      toggle={() => toggle(open => !open)}
    >
      <DropdownToggle
        color=''
        className='btn-sm btn-ghost btn-square'
        aria-label='Row actions'
      >
        <EllipsisHorizontalIcon
          data-icon='ellipsis-horizontal'
          className={`hero-icon size-6 ${props.className || ''}`}
          aria-hidden='true'
        />
      </DropdownToggle>
      {isOpen && (
        <DropdownMenu
          tag='ul'
          end
          container='body'
          strategy='fixed'
          className='menu z-[1100] min-w-40 rounded-box border border-main-border bg-base-100 p-1 text-base-content shadow-lg'
        >
          {actions.map(action => (
            <li key={action.title} role='none'>
              <DropdownItem
                onClick={action.onClick}
                className={`w-full text-left ${
                  /^(Delete|Revoke|Disassociate)$/.test(action.title)
                    ? 'text-error'
                    : 'text-base-content'
                }`}
              >
                {action.title}
              </DropdownItem>
            </li>
          ))}
        </DropdownMenu>
      )}
    </Dropdown>
  );
};
export default ListActionsDropdown;
