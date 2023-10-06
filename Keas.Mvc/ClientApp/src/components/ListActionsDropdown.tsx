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

  const renderAction = (action: IAction) => {
    return (
      <DropdownItem key={action.title} onClick={action.onClick}>
        {action.title}
      </DropdownItem>
    );
  };

  return (
    <Dropdown direction='start' isOpen={isOpen} toggle={() => toggle(!isOpen)}>
      <DropdownToggle color='link'>
        <i
          className={`fas fa-ellipsis-h fa-lg ${props.className}`}
          aria-hidden='true'
        />
      </DropdownToggle>
      <DropdownMenu>{actions.map(renderAction)}</DropdownMenu>
    </Dropdown>
  );
};
export default ListActionsDropdown;
