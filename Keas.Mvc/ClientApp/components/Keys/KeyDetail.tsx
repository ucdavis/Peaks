import * as React from "react";

import { IKey } from "../../Types";

interface IProps {
  keyEntity: IKey;
}

export default class KeyDetail extends React.Component<IProps, {}> {
  public render() {
    return (
      <tr>
        <td>{this.props.keyEntity.serialNumber}</td>
        <td>{this.props.keyEntity.name}</td>
        <td>{this.props.keyEntity.assignment.id}</td>
        <td>{this.props.keyEntity.assignment.expiresAt}</td>
      </tr>
    );
  }
}
