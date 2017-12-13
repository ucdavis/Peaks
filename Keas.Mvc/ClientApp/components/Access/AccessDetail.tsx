import * as React from "react";

import { IAccessAssignment } from "../../Types";

interface IProps {
  assignment: IAccessAssignment;
}

export default class AccessDetail extends React.Component<IProps, {}> {
  public render() {
    return <li>{this.props.assignment.access.name}</li>;
  }
}
