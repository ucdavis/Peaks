import * as React from "react";

import { IEquipment } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    equipmentEntity: IEquipment;
    onRevoke?: (equipment: IEquipment) => void;
    onAdd?: (equipment: IEquipment) => void;
    showDetails?: (equipment: IEquipment) => void;
    onEdit?: (equipment: IEquipment) => void;
}


export default class EquipmentListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = !!this.props.equipmentEntity.assignment;
        return (
          <tr>
            <td>{this.props.equipmentEntity.serialNumber}</td>
            <td>{this.props.equipmentEntity.name}</td>
            <td>{hasAssignment ? this.props.equipmentEntity.assignment.person.name : ""}</td>
            <td>
              {hasAssignment ? this.props.equipmentEntity.assignment.expiresAt : ""}
            </td>
            <td>
              <ListActionsDropdown
                onRevoke={!!this.props.onRevoke && hasAssignment ? 
                  () => this.props.onRevoke(this.props.equipmentEntity) : null}
                onAdd={!!this.props.onAdd && !hasAssignment ? 
                  () => this.props.onAdd(this.props.equipmentEntity) : null}
                showDetails={!!this.props.showDetails ? 
                  () => this.props.showDetails(this.props.equipmentEntity) : null}
                onEdit={!!this.props.onEdit ? 
                  () => this.props.onEdit(this.props.equipmentEntity) : null}
                />
            </td>
          </tr>
        );
      }
}
