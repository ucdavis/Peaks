import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  equipmentEntity: IEquipment;
  onRevoke?: (equipment: IEquipment) => void;
  onDelete?: (equipment: IEquipment) => void;
  onAdd?: (equipment: IEquipment) => void;
  showDetails?: (equipment: IEquipment) => void;
  onEdit?: (equipment: IEquipment) => void;
  onDuplicate?: (equipment: IEquipment) => void;
}

const EquipmentListItem = (props: IProps) => {
  const hasAssignment = !!props.equipmentEntity.assignment;

  const actions: IAction[] = [];
  if (!!props.onAdd && !hasAssignment) {
    actions.push({
      onClick: () => props.onAdd(props.equipmentEntity),
      title: 'Assign'
    });
  }

  if (!!props.onRevoke && hasAssignment) {
    actions.push({
      onClick: () => props.onRevoke(props.equipmentEntity),
      title: 'Revoke'
    });
  }

  if (!!props.onDelete) {
    actions.push({
      onClick: () => props.onDelete(props.equipmentEntity),
      title: 'Delete'
    });
  }

  if (!!props.onDuplicate) {
    actions.push({
      onClick: () => props.onDuplicate(props.equipmentEntity),
      title: 'Duplicate'
    });
  }

  return (
    <tr>
      <td>
        <Button
          color='link'
          onClick={() => props.showDetails(props.equipmentEntity)}
        >
          Details
        </Button>
      </td>
      <td>{props.equipmentEntity.serialNumber}</td>
      <td>{props.equipmentEntity.name}</td>
      <td>
        {hasAssignment
          ? `${props.equipmentEntity.assignment.person.lastName}, ${props.equipmentEntity.assignment.person.firstName}`
          : ''}
      </td>
      <td>
        {hasAssignment
          ? DateUtil.formatExpiration(
              props.equipmentEntity.assignment.expiresAt
            )
          : ''}
      </td>
      <td>
        <ListActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export default EquipmentListItem;
