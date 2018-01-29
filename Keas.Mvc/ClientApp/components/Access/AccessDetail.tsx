import * as React from "react";

import { IAccessAssignment } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    assignment: IAccessAssignment;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
}

export default class AccessDetail extends React.Component<IProps, {}> {

    private _onRevoke = () => {
        this.props.onRevoke(this.props.assignment);
    }
    public render() {
        return (
            <tr>
                <td>{this.props.assignment.access.name}</td>
                <td>{this.props.assignment.access.teamId}</td>
                <td>{this.props.assignment.expiresAt}</td>
                <td>
                    <ListActionsDropdown onRevoke={this._onRevoke} canRevoke={this.props.assignment != null} />
                </td>
            </tr>
        );
  }
}