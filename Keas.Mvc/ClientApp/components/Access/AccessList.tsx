import * as React from "react";

import AccessDetail from "./AccessDetail";

import { IAccessAssignment } from "../../Types";

interface IProps {
  accessAssignments: IAccessAssignment[];
}

export default class AccessList extends React.Component<IProps, {}> {
  public render() {
    const keys = this.props.accessAssignments.map((x) => <AccessDetail assignment={x} />);
    return (
      <ul>
        {keys}
      </ul>
    );
  }
}
