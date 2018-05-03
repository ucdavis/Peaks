import * as React from "react";

import { IEquipment } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    equipmentEntity: IEquipment;
    onRevoke: (equipment: IEquipment) => void;
    onAdd: (equipment: IEquipment) => void;
    showDetails: (equipment: IEquipment) => void;
}


export default class EquipmentListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = !!this.props.equipmentEntity.assignment;
        return (
          <tr>
            <td>{this.props.equipmentEntity.serialNumber}</td>
            <td>{this.props.equipmentEntity.name}</td>
            <td>{hasAssignment ? this.props.equipmentEntity.assignment.person.user.name : ""}</td>
            <td>
              {hasAssignment ? this.props.equipmentEntity.assignment.expiresAt : ""}
            </td>
            <td>
                    <ListActionsDropdown
                        onRevoke={this._onRevoke}
                        canRevoke={hasAssignment}
                        onAdd={this._onAdd}
                        canAdd={!hasAssignment}
                        showDetails={this._showDetails}
                    />
            </td>
          </tr>
        );
      }
    private _onRevoke = () => {
        this.props.onRevoke(this.props.equipmentEntity);
    }
    private _onAdd = () => {
        this.props.onAdd(this.props.equipmentEntity);
    }
    private _showDetails = () => {
        this.props.showDetails(this.props.equipmentEntity);
    }
}
