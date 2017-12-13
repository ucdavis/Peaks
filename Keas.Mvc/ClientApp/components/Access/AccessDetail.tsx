import * as React from "react";

import { IAccessAssignment } from "../../Types";

interface IProps {
    assignment: IAccessAssignment;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
}

export default class AccessDetail extends React.Component<IProps, {}> {
    public render() {
        return <li onClick={() => this.props.onRevoke(this.props.assignment)}> { this.props.assignment.access.name }</li >;
  }
}
