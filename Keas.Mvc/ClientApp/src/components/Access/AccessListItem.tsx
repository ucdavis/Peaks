import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  assignment: IAccessAssignment; // will have populated access
  personView: boolean;
  personId: number;
  onAdd?: (access: IAccess) => void;
  onRevoke?: (accessAssignment: IAccessAssignment) => void;
  showDetails: (accessAssignment: IAccessAssignment) => void;
}

const AccessAssignmentListItem = (props: IProps) => {
  const hasAssignment = !!props.assignment;
  const canAdd = !props.personView || !hasAssignment;
  const expirationDate = DateUtil.formatExpiration(props.assignment.expiresAt);

  const actions: IAction[] = [];
  if (!!props.onAdd && canAdd) {
    actions.push({
      onClick: () => props.onAdd(props.assignment.access),
      title: 'Assign'
    });
  }

  if (!!props.onRevoke && hasAssignment) {
    actions.push({
      onClick: () => props.onRevoke(props.assignment),
      title: 'Revoke'
    });
  }

  return (
    <tr>
      <td>
        <Button
          color='link'
          onClick={() => props.showDetails(props.assignment)}
        >
          Details
        </Button>
      </td>
      <td>{props.assignment.access.name}</td>
      <td>{hasAssignment ? 'Assigned' : 'Unassigned'}</td>
      <td>{props.assignment.access.numberOfAssignments}</td>
      <td>{expirationDate}</td>
      <td>
        <ListActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export default AccessAssignmentListItem;
