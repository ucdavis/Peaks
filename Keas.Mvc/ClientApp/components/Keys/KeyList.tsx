import * as React from "react";

import { IKeyAssignment } from "../../Types";

interface IProps {
  keyAssignments: [IKeyAssignment];
}

export default class KeyList extends React.Component<IProps, {}> {
  public render() {
    const keys = this.props.keyAssignments.map(x=> <li>{x.key.name}</li>);
    return (
      <ul>
        {keys}
      </ul>
    );
  }
}
