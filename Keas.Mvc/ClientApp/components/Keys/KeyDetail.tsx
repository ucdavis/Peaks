import * as React from "react";

import { IKey } from "../../Types";

interface IProps {
  keyEntity: IKey;
}

export default class KeyDetail extends React.Component<IProps, {}> {
  public render() {
    const hasAssignment = !!this.props.keyEntity.assignment;
    return (
      <tr>
        <td>{this.props.keyEntity.serialNumber}</td>
        <td>{this.props.keyEntity.name}</td>
        <td>{hasAssignment ? "Assigned" : "Unassigned"}</td>
        <td>
          {hasAssignment ? this.props.keyEntity.assignment.expiresAt : ""}
        </td>
      </tr>
    );
  }
}
