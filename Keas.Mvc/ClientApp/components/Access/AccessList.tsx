import * as React from "react";
import { IAccess } from "../../Types";
import AccessListItem from "./AccessListItem";

interface IProps {
    access: IAccess[];
    personView: boolean;
    onRevoke: (access: IAccess) => void;
    onDelete: (access: IAccess) => void;
    onAdd: (access: IAccess) => void;
    onEdit: (access: IAccess) => void;
    showDetails: (access: IAccess) => void;
}

export default class AccessList extends React.Component<IProps, {}> {
    public render() {
        const access =
            !this.props.access || this.props.access.length < 1 ? (
                <tr>
                    <td colSpan={5}>No Accesses Found</td>
                </tr>
            ) : (
                this.props.access.map(x => (
                    <AccessListItem
                        key={x.id.toString()}
                        accessEntity={x}
                        personView={this.props.personView}
                        onRevoke={this.props.onRevoke}
                        onDelete={this.props.onDelete}
                        onAdd={this.props.onAdd}
                        onEdit={this.props.onEdit}
                        showDetails={this.props.showDetails}
                    />
                ))
            );
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th />
                        <th>Name</th>
                        <th>Assigned?</th>
                        <th>Number of Assignments</th>
                        <th>Expiration</th>
                        <th className="list-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>{access}</tbody>
            </table>
        );
    }
}
