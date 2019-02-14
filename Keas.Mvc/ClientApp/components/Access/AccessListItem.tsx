import * as React from "react";
import { Button } from "reactstrap";
import { IAccess } from "../../Types";
import { DateUtil } from "../../util/dates";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

interface IProps {
    accessEntity: IAccess;
    personView: boolean;
    onRevoke: (access: IAccess) => void;
    onDelete: (access: IAccess) => void;
    onAdd: (access: IAccess) => void;
    onEdit: (access: IAccess) => void;
    showDetails: (access: IAccess) => void;
}

export default class AccessListItem extends React.Component<IProps, {}> {
    public render() {
        const hasAssignment = this.props.accessEntity.assignments.length > 0;
        const canAdd = !this.props.personView || !hasAssignment;
        const dates = this.props.accessEntity.assignments.map(x => x.expiresAt);
        const expirationDate = hasAssignment ? DateUtil.formatFirstExpiration(dates) : "";

        const actions: IAction[] = [];
        if (!!this.props.onAdd && canAdd) {
            actions.push({
                onClick: () => this.props.onAdd(this.props.accessEntity),
                title: "Assign"
            });
        }

        if (!!this.props.onDelete) {
            actions.push({
                onClick: () => this.props.onDelete(this.props.accessEntity),
                title: "Delete"
            });
        }

        return (
            <tr>
                <td>
                    <Button
                        color="link"
                        onClick={() => this.props.showDetails(this.props.accessEntity)}
                    >
                        Details
                    </Button>
                </td>
                <td>{this.props.accessEntity.name}</td>
                <td>{hasAssignment ? "Assigned" : "Unassigned"}</td>
                <td>{this.props.accessEntity.assignments.length}</td>
                <td>{expirationDate}</td>
                <td>
                    <ListActionsDropdown actions={actions} />
                </td>
            </tr>
        );
    }
}
