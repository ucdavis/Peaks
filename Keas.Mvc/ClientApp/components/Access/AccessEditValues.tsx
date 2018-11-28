import * as React from "react";

import { IAccess, IAccessAssignment } from "../../Types";

import ReactTable from 'react-table';
import { DateUtil } from "../../util/dates";
import SearchTags from "../Tags/SearchTags";



interface IProps {
    selectedAccess: IAccess;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
    tags?: string[];
}

export default class AccessEditValues extends React.Component<IProps, {}> {

    public render() {
        const columns = [{
            id: "personFirstName",
            Header: "First Name",
            accessor: x=> x.person.firstName
        }, {
            id: "personLastName",
            Header: "Last Name",
            accessor: x=> x.person.lastName
        }, {
            id: "expiresAt",
            Header: "Expires at",
            accessor: x=> DateUtil.formatExpiration(x.expiresAt)
        },{
            Header: "Revoke",
            Cell: row => (<button type="button" className="btn btn-outline-danger" disabled={this.props.disableEditing  || !this.props.onRevoke}
                onClick={() => this._revokeSelected(row.original.person.id)}><i className="fas fa-trash" /></button>),        
            sortable: false,
        }]     

        return (
            <div>
                <div className="form-group">
                    <label>Item</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedAccess && this.props.selectedAccess.name ? this.props.selectedAccess.name : ""}
                        onChange={(e) => this.props.changeProperty("name", e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Tags</label>
                    <SearchTags 
                        tags={this.props.tags} 
                        disabled={this.props.disableEditing}
                        selected={!!this.props.selectedAccess && !!this.props.selectedAccess.tags ? this.props.selectedAccess.tags.split(",") : []}
                        onSelect={(e) => this.props.changeProperty("tags", e.join(","))} />
                </div>
                {this.props.selectedAccess.teamId !== 0 &&
                <div>
                    <h3>Assigned to:</h3>             
                    <ReactTable data={this.props.selectedAccess.assignments} columns={columns} minRows={1} />
                </div>}
            </div>
        );
    }

    private _revokeSelected = async (personId: number) => { 
        const accessAssignment = this.props.selectedAccess.assignments.filter(x => x.personId === personId);
        await this.props.onRevoke(accessAssignment[0]);
    };
}
