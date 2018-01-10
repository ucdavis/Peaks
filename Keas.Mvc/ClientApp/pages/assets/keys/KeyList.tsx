import * as React from "react";

import { IKey } from "../../../Types";

interface IProps {
  keys: IKey[];
}

export default class KeyList extends React.Component<IProps, {}> {
  public render() {
    const keys = this.props.keys.map(x => (
        <li key={x.id}>{x.name}</li>
    ));
    return <ul>{keys}</ul>;
  }
}
