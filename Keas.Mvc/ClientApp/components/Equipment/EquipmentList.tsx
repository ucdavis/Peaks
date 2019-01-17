import * as React from "react";
import { IEquipment } from "../../Types";
import EquipmentListItem from "./EquipmentListItem";

interface IProps {
    equipment: IEquipment[];
    onRevoke?: (equipment: IEquipment) => void;
    onDelete?: (equipment: IEquipment) => void;
    onAdd?: (equipment: IEquipment) => void;
    showDetails?: (equipment: IEquipment) => void;
    onEdit?: (equipment: IEquipment) => void;
}

export default class EquipmentList extends React.Component<IProps, {}> {
  public render() {
      const equipment = !this.props.equipment || this.props.equipment.length < 1 ?
          <tr><td colSpan={5}>No Equipment Found</td></tr> :
          this.props.equipment.map(x => (
          <EquipmentListItem
              key={x.id.toString()}
              equipmentEntity={x}
              onRevoke={this.props.onRevoke}
              onDelete={this.props.onDelete}
              onAdd={this.props.onAdd}
              showDetails={this.props.showDetails}
              onEdit={this.props.onEdit}
          />
    ));
      return (
      <div className="table">
        <table className="table">
          <thead>
            <tr>
              <th/>
              <th>Serial</th>
              <th>Number</th>
              <th>Assigned To</th>
              <th>Expiration</th>
              <th className="list-actions">Actions</th>
            </tr>
          </thead>
          <tbody>{equipment}</tbody>
        </table>
      </div>
    );
  }
}
