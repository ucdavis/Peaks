import * as React from "react";

import { IKey } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    keyEntity: IKey;
    onRevoke?: (key: IKey) => void;
    onAdd?: (key: IKey) => void;
    showDetails?: (key: IKey) => void;
    onEdit?: (key: IKey) => void;
}


export default class KeyListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = !!this.props.keyEntity.assignment;
        return (
          <tr>
            <td>{this.props.keyEntity.serialNumber}</td>
            <td>{this.props.keyEntity.name}</td>
            <td>{hasAssignment ? this.props.keyEntity.assignment.person.name : ""}</td>
            <td>
              {hasAssignment ? this.props.keyEntity.assignment.expiresAt : ""}
            </td>
            <td>
                    <ListActionsDropdown
                        onRevoke={!!this.props.onRevoke && hasAssignment ? 
                          () => this.props.onRevoke(this.props.keyEntity) : null}
                        onAdd={!!this.props.onAdd && !hasAssignment ? 
                          () => this.props.onAdd(this.props.keyEntity) : null}
                        showDetails={!!this.props.showDetails ? 
                          () => this.props.showDetails(this.props.keyEntity) : null}
                        onEdit={!!this.props.onEdit ? 
                          () => this.props.onEdit(this.props.keyEntity) : null}
                    />
            </td>
          </tr>
        );
      }
}
