import * as moment from "moment";
import * as React from "react";
import { IAccess } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    accessEntity: IAccess;
    personView: boolean;
    onRevoke: (access: IAccess) => void;
    onAdd: (access: IAccess) => void;
    onEdit: (access: IAccess) => void;
    showDetails: (access: IAccess) => void;
}


export default class AccessListItem extends React.Component<IProps, {}> {

    public render() {
        const hasAssignment = this.props.accessEntity.assignments.length > 0;
        const canAdd = !this.props.personView || !hasAssignment;
        const dates = this.props.accessEntity.assignments.map(x => moment(x.expiresAt));
        const expirationDate = hasAssignment ? moment.min(dates).format("MM/DD/YYYY").toString() : "";
        return (
            <tr>
                <td>{this.props.accessEntity.name}</td>
                <td>{hasAssignment ? "Assigned" : "Unassigned"}</td>
                <td>{this.props.accessEntity.assignments.length}</td>
                <td>{expirationDate}</td>
                <td>
                    <ListActionsDropdown
                        onRevoke={() => this.props.onRevoke(this.props.accessEntity)}
                        canRevoke={hasAssignment}
                        onAdd={() => this.props.onAdd(this.props.accessEntity)}
                        canAdd={canAdd}
                        onEdit={() => this.props.onEdit(this.props.accessEntity)}
                        showDetails={() => this.props.showDetails(this.props.accessEntity)}
                    />
                </td>
            </tr>
        );
    }
}
