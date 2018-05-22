import * as React from "react";

import { IKey } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    keyEntity: IKey;
    onRevoke: (key: IKey) => void;
    onAdd: (key: IKey) => void;
    showDetails: (key: IKey) => void;
    onEdit: (key: IKey) => void;
}


export default class KeyListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = !!this.props.keyEntity.assignment;
        return (
          <tr>
            <td>{this.props.keyEntity.serialNumber}</td>
            <td>{this.props.keyEntity.name}</td>
            <td>{hasAssignment ? this.props.keyEntity.assignment.person.user.name : ""}</td>
            <td>
              {hasAssignment ? this.props.keyEntity.assignment.expiresAt : ""}
            </td>
            <td>
                    <ListActionsDropdown
                        onRevoke={() => this.props.onRevoke(this.props.keyEntity)}
                        canRevoke={hasAssignment}
                        onAdd={() => this.props.onAdd(this.props.keyEntity)}
                        canAdd={!hasAssignment}
                        showDetails={() => this.props.showDetails(this.props.keyEntity)}
                        onEdit={() => this.props.onEdit(this.props.keyEntity)}
                    />
            </td>
          </tr>
        );
      }
}
