import * as React from "react";
//import { Button } from "reactstrap";

import { IAccessAssignment } from "../../Types";

interface IProps {
    assignment: IAccessAssignment;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
}

export default class AccessDetail extends React.Component<IProps, {}> {
    public render() {
        return (
            <tr>
                <td>{this.props.assignment.access.name}</td>
                <td>{this.props.assignment.access.teamId}</td>
                <td>{this.props.assignment.expiresAt}</td>
                <td>
                    <button type="button"  className="btn btn-danger" onClick={() => this.props.onRevoke(this.props.assignment)}><i className="fa fa-times" aria-hidden="true"></i></button>
                </td>
            </tr>
        );
  }
}