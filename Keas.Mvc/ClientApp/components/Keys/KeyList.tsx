import * as React from "react";

import KeyDetail from './KeyDetail';

import { IKeyAssignment } from "../../Types";

interface IProps {
  keyAssignments: IKeyAssignment[];
}

export default class KeyList extends React.Component<IProps, {}> {
  public render() {
    const keys = this.props.keyAssignments.map(x=> <KeyDetail key={x.id.toString()} assignment={x} />);
    return (
      <ul>
        {keys}
      </ul>
    );
  }
}
