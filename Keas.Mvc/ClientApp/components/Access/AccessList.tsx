import * as React from "react";

import AccessDetail from "./AccessDetail";

import { IAccessAssignment } from "../../Types";

interface IProps {
    accessAssignments: IAccessAssignment[];
    onRevoke: (accessAssignment: IAccessAssignment) => void;
}

export default class AccessList extends React.Component<IProps, {}> {
    public render() {
        const accessList = this.props.accessAssignments.map((x) => <AccessDetail key={x.id.toString()} assignment={x} onRevoke={this.props.onRevoke} />);
    return (
      <ul>
        {accessList}
      </ul>
    );
  }
}
