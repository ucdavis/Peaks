import * as React from "react";

import EquipmentDetail from "./EquipmentDetail";

import { IEquipment } from "../../Types";

interface IProps {
  equipment: IEquipment[];
}

export default class EquipmentList extends React.Component<IProps, {}> {
  public render() {
    const equipment = this.props.equipment.map(x => (
      <EquipmentDetail key={x.id.toString()} equipmentEntity={x} />
    ));
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Number</th>
            <th>Assigned?</th>
            <th>Expiration</th>
          </tr>
        </thead>
        <tbody>{equipment}</tbody>
      </table>
    );
  }
}
