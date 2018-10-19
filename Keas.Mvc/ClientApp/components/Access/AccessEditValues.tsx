import * as moment from "moment";
import * as React from "react";

import { IAccess, IAccessAssignment, IPerson } from "../../Types";

import ReactTable from 'react-table';



interface IProps {
    selectedAccess: IAccess;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    creating?: boolean;
    onRevoke: (accessAssignment: IAccessAssignment) => void;
}

interface IState {
    access: IAccess;
}


export default class AccessEditValues extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            access: this.props.selectedAccess
        };
    }

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
            id: "expiresAt"
            Header: "Expires at",
            accessor: x=> moment(x.expiresAt).format("MM/DD/YYYY").toString()
        },{
            Header: "Revoke",
            Cell: <button type="button" className="btn btn-outline-danger" onClick={() => this._revokeSelected(x=> x.person)}><i className="fas fa-trash" /></button>,
            sortable: false,
        }]     

        return (
            <div>
                {!this.props.creating &&
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedAccess.name ? this.props.selectedAccess.name : ""}
                        onChange={(e) => this.props.changeProperty("name", e.target.value)}
                    />
                </div>}
                <h3>Assigned to:</h3>             
                <ReactTable data={this.props.selectedAccess.assignments} columns={columns} minRows={1} />
            </div>
        );
    }

    private _revokeSelected = async (personToRevoke: IPerson) => {                    
        const accessAssignment = this.state.access.assignments.filter(x => x.personId === personToRevoke.id);

        await this.props.onRevoke(accessAssignment[0]);
    };
}
