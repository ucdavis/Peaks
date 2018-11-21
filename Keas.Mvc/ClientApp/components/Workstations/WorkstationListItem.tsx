import * as React from "react";

import { IWorkstation } from "../../Types";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

import { DateUtil } from "../../util/dates";

interface IProps {
    workstationEntity: IWorkstation;
    onRevoke?: (workstation: IWorkstation) => void;
    onAdd?: (workstation: IWorkstation) => void;
    showDetails?: (workstation: IWorkstation) => void;
    onEdit?: (workstation: IWorkstation) => void;
}


export default class WorkstationListItem extends React.Component<IProps, {}> {
    public render() {
        const { workstationEntity } = this.props;
        const hasAssignment = !!this.props.workstationEntity.assignment;

        const actions: IAction[] = [];
        if (!!this.props.onRevoke && hasAssignment) {
          actions.push({ title: 'Revoke', onClick: () => this.props.onRevoke(workstationEntity) });
        }

        if (!!this.props.onAdd && !hasAssignment) {
            actions.push({ title: 'Add', onClick: () => this.props.onAdd(workstationEntity) });
        }
        else if (!!this.props.onAdd && hasAssignment) {
          actions.push({ title: 'Update', onClick: () => this.props.onAdd(workstationEntity) });
        }

        if (!!this.props.showDetails) {
            actions.push({ title: 'Details', onClick: () => this.props.showDetails(workstationEntity) });
        }

        if (!!this.props.onEdit) {
            actions.push({ title: 'Edit', onClick: () => this.props.onEdit(workstationEntity) });
        }

        return (
          <tr>
            <td>{this.props.workstationEntity.name}</td>
            <td>{this.props.workstationEntity.space ? 
              this.props.workstationEntity.space.roomNumber + " " + this.props.workstationEntity.space.bldgName : ""}</td>
            <td>{hasAssignment ? this.props.workstationEntity.assignment.person.name : ""}</td>
            <td>
              {hasAssignment ? DateUtil.formatExpiration(this.props.workstationEntity.assignment.expiresAt) : ""}
            </td>
            <td>
              <ListActionsDropdown actions={actions} />
            </td>
          </tr>
        );
      }
}
