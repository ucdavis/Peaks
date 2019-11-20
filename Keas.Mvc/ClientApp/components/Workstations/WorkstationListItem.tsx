import * as React from 'react';
import { Button } from 'reactstrap';
import { IWorkstation } from '../../models/Workstations';
import { DateUtil } from '../../util/dates';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  workstationEntity: IWorkstation;
  onRevoke?: (workstation: IWorkstation) => void;
  onAdd?: (workstation: IWorkstation) => void;
  showDetails?: (workstation: IWorkstation) => void;
  onEdit?: (workstation: IWorkstation) => void;
  onDelete?: (workstation: IWorkstation) => void;
}

export default class WorkstationListItem extends React.Component<IProps, {}> {
  public render() {
    const { workstationEntity } = this.props;
    const hasAssignment = !!this.props.workstationEntity.assignment;

    const actions: IAction[] = [];

    if (!!this.props.onAdd && !hasAssignment) {
      actions.push({
        title: 'Assign',
        onClick: () => this.props.onAdd(workstationEntity)
      });
    }

    if (!!this.props.onRevoke && hasAssignment) {
      actions.push({
        onClick: () => this.props.onRevoke(workstationEntity),
        title: 'Revoke'
      });
    }

    if (!!this.props.onDelete) {
      actions.push({
        onClick: () => this.props.onDelete(workstationEntity),
        title: 'Delete'
      });
    }

    return (
      <tr>
        <td>
          <Button
            color='link'
            onClick={() => this.props.showDetails(this.props.workstationEntity)}
          >
            Details
          </Button>
        </td>
        <td>{this.props.workstationEntity.name}</td>
        <td>
          {this.props.workstationEntity.space
            ? this.props.workstationEntity.space.roomNumber +
              ' ' +
              this.props.workstationEntity.space.bldgName
            : ''}
        </td>
        <td>
          {hasAssignment
            ? this.props.workstationEntity.assignment.person.name
            : ''}
        </td>
        <td>
          {hasAssignment
            ? DateUtil.formatExpiration(
                this.props.workstationEntity.assignment.expiresAt
              )
            : ''}
        </td>
        <td>
          <ListActionsDropdown actions={actions} />
        </td>
      </tr>
    );
  }
}
