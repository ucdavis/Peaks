import * as React from "react";

import { IKeyAssignment } from "../../Types";

interface IProps {
  assignment: IKeyAssignment;
}

export default class KeyDetail extends React.Component<IProps, {}> {
  public render() {
    return <li>{this.props.assignment.key.name}</li>;
  }
}
