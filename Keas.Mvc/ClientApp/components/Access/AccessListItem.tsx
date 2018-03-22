import * as React from "react";

import { IAccess } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    accessEntity: IAccess;
    onRevoke: (access: IAccess) => void;
    onAdd: (access: IAccess) => void;
    showDetails: (access: IAccess) => void;
}


export default class AccessListItem extends React.Component<IProps, {}> {

    private _onRevoke = () => {
        this.props.onRevoke(this.props.accessEntity);
    }
    private _onAdd = () => {
        this.props.onAdd(this.props.accessEntity);
    }
    private _showDetails = () => {
        this.props.showDetails(this.props.accessEntity);
    }

  public render() {
    const hasAssignment = !!this.props.accessEntity.assignment;
    return (
      <tr>
        <td>{this.props.accessEntity.serialNumber}</td>
        <td>{this.props.accessEntity.name}</td>
        <td>{hasAssignment ? "Assigned" : "Unassigned"}</td>
        <td>
          {hasAssignment ? this.props.accessEntity.assignment.expiresAt : ""}
        </td>
        <td>
                <ListActionsDropdown
                    onRevoke={this._onRevoke}
                    canRevoke={hasAssignment}
                    onAdd={this._onAdd}
                    canAdd={!hasAssignment}
                    showDetails={this._showDetails}
                />
        </td>
      </tr>
    );
  }
}
