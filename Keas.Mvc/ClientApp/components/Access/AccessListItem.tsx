import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  accessEntity: IAccess;
  personView: boolean;
  onDelete?: (access: IAccess) => void;
  onAdd?: (access: IAccess) => void;
  onRevoke?: (access: IAccess) => void;
  showDetails: (access: IAccess) => void;
}

const AccessListItem = (props: IProps) => {
  const hasAssignment = props.accessEntity.assignments.length > 0;
  const canAdd = !props.personView || !hasAssignment;
  const dates = props.accessEntity.assignments.map(x => x.expiresAt);
  const expirationDate = hasAssignment
    ? DateUtil.formatFirstExpiration(dates)
    : '';

  const actions: IAction[] = [];
  if (!!props.onAdd && canAdd) {
    actions.push({
      onClick: () => props.onAdd(props.accessEntity),
      title: 'Assign'
    });
  }

  if (!!props.onDelete) {
    actions.push({
      onClick: () => props.onDelete(props.accessEntity),
      title: 'Delete'
    });
  }

  if (!!props.onRevoke && hasAssignment) {
    actions.push({
      onClick: () => props.onRevoke(props.accessEntity),
      title: 'Revoke'
    });
  }

  return (
    <tr>
      <td>
        <Button
          color='link'
          onClick={() => props.showDetails(props.accessEntity)}
        >
          Details
        </Button>
      </td>
      <td>{props.accessEntity.name}</td>
      <td>{hasAssignment ? 'Assigned' : 'Unassigned'}</td>
      <td>{props.accessEntity.assignments.length}</td>
      <td>{expirationDate}</td>
      <td>
        <ListActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export default AccessListItem;
