import * as React from "react";
import { IEquipment } from "../../Types";
import { DateUtil } from "../../util/dates";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";
import { Button } from "reactstrap";


interface IProps {
    equipmentEntity: IEquipment;
    onRevoke?: (equipment: IEquipment) => void;
    onDelete?: (equipment: IEquipment) => void;
    onAdd?: (equipment: IEquipment) => void;
    showDetails?: (equipment: IEquipment) => void;
    onEdit?: (equipment: IEquipment) => void;
}


export default class EquipmentListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = !!this.props.equipmentEntity.assignment;

        const actions: IAction[] = [];
        if (!!this.props.onRevoke && hasAssignment) {
          actions.push({ title: 'Revoke', onClick: () => this.props.onRevoke(this.props.equipmentEntity) });
        }

        if (!!this.props.onAdd && !hasAssignment) {
            actions.push({ title: 'Add', onClick: () => this.props.onAdd(this.props.equipmentEntity) });
        }
        else if (!!this.props.onAdd && hasAssignment) {
          actions.push({ title: 'Update', onClick: () => this.props.onAdd(this.props.equipmentEntity) });
        }

        if (!!this.props.showDetails) {
            actions.push({ title: 'Details', onClick: () => this.props.showDetails(this.props.equipmentEntity) });
        }

        if (!!this.props.onEdit) {
            actions.push({ title: 'Edit', onClick: () => this.props.onEdit(this.props.equipmentEntity) });
        }

        if (!!this.props.onDelete) {
            actions.push({ title: 'Delete', onClick: () => this.props.onDelete(this.props.equipmentEntity) });
        }

        return (
          <tr>
            <td>
              <Button color="link" onClick={() => this.props.showDetails(this.props.equipmentEntity)}>
                Details
              </Button>
            </td>
            <td>{this.props.equipmentEntity.serialNumber}</td>
            <td>{this.props.equipmentEntity.name}</td>
            <td>{hasAssignment ? this.props.equipmentEntity.assignment.person.name : ""}</td>
            <td>
              {hasAssignment ? DateUtil.formatExpiration(this.props.equipmentEntity.assignment.expiresAt) : ""}
            </td>
            <td>
              <ListActionsDropdown actions={actions} />
            </td>
          </tr>
        );
      }
}
