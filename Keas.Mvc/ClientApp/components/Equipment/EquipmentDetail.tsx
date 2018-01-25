import * as React from "react";

import { IEquipment } from "../../Types";

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
                <button type="button" className="btn btn-danger" onClick={() => this.props.onRevoke(this.props.equipmentEntity)} hidden={!hasAssignment}><i className="fa fa-times" aria-hidden="true" ></i></button>
        </td>
      </tr>
    );
  }
}
