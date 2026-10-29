import { AssetDetailsLink } from '../Shared/AssetDetailsLink';
import * as React from 'react';
import { IWorkstation } from '../../models/Workstations';
import { DateUtil } from '../../util/dates';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  workstationEntity: IWorkstation;
  detailsBasePath: string;
  onRevoke?: (workstation: IWorkstation) => void;
  onAdd?: (workstation: IWorkstation) => void;
  showDetails?: (workstation: IWorkstation) => void;
  onEdit?: (workstation: IWorkstation) => void;
  onDelete?: (workstation: IWorkstation) => void;
}

const WorkstationListItem = (props: IProps) => {
  const { workstationEntity } = props;
  const hasAssignment = !!props.workstationEntity.assignment;

  const actions: IAction[] = [];

  if (!!props.onAdd && !hasAssignment) {
    actions.push({
      title: 'Assign',
      onClick: () => props.onAdd(workstationEntity)
    });
  }

  if (!!props.onRevoke && hasAssignment) {
    actions.push({
      onClick: () => props.onRevoke(workstationEntity),
      title: 'Revoke'
    });
  }

  if (!!props.onDelete) {
    actions.push({
      onClick: () => props.onDelete(workstationEntity),
      title: 'Delete'
    });
  }

  return (
    <tr>
      <td>
        <AssetDetailsLink
          path={`${props.detailsBasePath}/workstations/details/${props.workstationEntity.id}`}
          onClick={() => props.showDetails(props.workstationEntity)}
        />
      </td>
      <td>{props.workstationEntity.name}</td>
      <td>
        {props.workstationEntity.space
          ? props.workstationEntity.space.roomNumber +
            ' ' +
            props.workstationEntity.space.bldgName
          : ''}
      </td>
      <td>
        {hasAssignment
          ? `${props.workstationEntity.assignment.person.lastName}, ${props.workstationEntity.assignment.person.firstName}`
          : ''}
      </td>
      <td>
        {hasAssignment
          ? DateUtil.formatExpiration(
              props.workstationEntity.assignment.expiresAt
            )
          : ''}
      </td>
      <td>
        <ListActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export default WorkstationListItem;
