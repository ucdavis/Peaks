import * as React from "react";

import { IWorkstation } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    workstationEntity: IWorkstation;
    onRevoke?: (workstation: IWorkstation) => void;
    onAdd?: (workstation: IWorkstation) => void;
    showDetails?: (workstation: IWorkstation) => void;
    onEdit?: (workstation: IWorkstation) => void;
}


export default class EquipmentListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = !!this.props.workstationEntity.assignment;
        return (
          <tr>
            <td>{this.props.workstationEntity.name}</td>
            <td>{hasAssignment ? this.props.workstationEntity.assignment.person.name : ""}</td>
            <td>
              {hasAssignment ? this.props.workstationEntity.assignment.expiresAt : ""}
            </td>
            <td>
              <ListActionsDropdown
                onRevoke={!!this.props.onRevoke && hasAssignment ? 
                  () => this.props.onRevoke(this.props.workstationEntity) : null}
                onAdd={!!this.props.onAdd && !hasAssignment ? 
                  () => this.props.onAdd(this.props.workstationEntity) : null}
                showDetails={!!this.props.showDetails ? 
                  () => this.props.showDetails(this.props.workstationEntity) : null}
                onEdit={!!this.props.onEdit ? 
                  () => this.props.onEdit(this.props.workstationEntity) : null}
                />
            </td>
          </tr>
        );
      }
}
