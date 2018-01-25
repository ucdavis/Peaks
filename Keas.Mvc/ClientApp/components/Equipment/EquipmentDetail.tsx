import * as React from "react";

import { IEquipment } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    equipmentEntity: IEquipment;
    onRevoke: (equipment: IEquipment) => void;
}

export default class EquipmentDetail extends React.Component<IProps, {}> {
  public render() {
    const hasAssignment = !!this.props.equipmentEntity.assignment;
    return (
      <tr>
        <td>{this.props.equipmentEntity.serialNumber}</td>
        <td>{this.props.equipmentEntity.name}</td>
        <td>{hasAssignment ? "Assigned" : "Unassigned"}</td>
        <td>
          {hasAssignment ? this.props.equipmentEntity.assignment.expiresAt : ""}
        </td>
        <td>
                <ListActionsDropdown onRevoke={this.props.onRevoke} asset={this.props.equipmentEntity} />
        </td>
      </tr>
    );
  }
}
