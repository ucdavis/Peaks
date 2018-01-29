import * as React from "react";

import EquipmentDetail from "./EquipmentDetail";

import { IEquipment } from "../../Types";

interface IProps {
    equipment: IEquipment[];
    onRevoke: (equipment: IEquipment) => void;
}

export default class EquipmentList extends React.Component<IProps, {}> {
  public render() {
      const equipment = this.props.equipment.map(x => (
          <EquipmentDetail key={x.id.toString()} equipmentEntity={x} onRevoke={this.props.onRevoke} />
    ));
    return (
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
    );
  }
}
