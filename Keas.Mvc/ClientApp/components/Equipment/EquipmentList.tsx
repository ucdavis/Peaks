import * as React from "react";

import EquipmentListItem from "./EquipmentListItem";

import { IEquipment } from "../../Types";

interface IProps {
    equipment: IEquipment[];
    onRevoke: (equipment: IEquipment) => void;
    onAdd: (equipment: IEquipment) => void;
    showDetails: (equipment: IEquipment) => void;
}

export default class EquipmentList extends React.Component<IProps, {}> {
  public render() {
      const equipment = this.props.equipment.map(x => (
          <EquipmentListItem
              key={x.id.toString()}
              equipmentEntity={x}
              onRevoke={this.props.onRevoke}
              onAdd={this.props.onAdd}
              showDetails={this.props.showDetails}
          />
    ));
      return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Number</th>
              <th>Assigned?</th>
              <th>Expiration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{equipment}</tbody>
        </table>
      </div>
    );
  }
}
