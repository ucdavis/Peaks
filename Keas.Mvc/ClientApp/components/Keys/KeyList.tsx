import * as React from "react";

import KeyDetail from "./KeyDetail";

import { IKey } from "../../Types";

interface IProps {
  keys: IKey[];
}

export default class KeyList extends React.Component<IProps, {}> {
  public render() {
    const keys = this.props.keys.map(x => (
      <KeyDetail key={x.id.toString()} keyEntity={x} />
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
        <tbody>{keys}</tbody>
      </table>
    );
  }
}
