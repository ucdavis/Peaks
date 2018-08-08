import * as moment from "moment";
import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { IPerson, IPersonInfo } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    people: IPersonInfo[];
    onRevoke?: (equipment: IPerson) => void;
    onAdd?: (equipment: IPerson) => void;
    showDetails?: (equipment: IPerson) => void;
    onEdit?: (equipment: IPerson) => void;
}

export default class PeopleTable extends React.Component<IProps, {}> {
  public render() {
      return (
        <ReactTable
        data={this.props.people}
        filterable={true}
        minRows={1}
        columns = {[
            {
                Header: "Name",
                accessor: "person.user.name",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
            },
            {
                Header: "Email",
                accessor: "person.user.email",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
            },
            {
                Header: "Keys",
                accessor: "keyCount",
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-key"></i> {row.original.keyCount}</span>
                ),
            },
            {
                Header: "Equipment",
                accessor: "equipmentCount",
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-laptop"></i> {row.original.equipmentCount}</span>
                ),                    
            },
            {
                Header: "Accesses",
                accessor: "accessCount",
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-id-card"></i> {row.original.accessCount}</span>
                ),
            },
            {
                Header: "Workstations",
                accessor: "workstationCount",
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-user"></i> {row.original.workstationCount}</span>
                ),
            },
            // {
            //     Header: "Assigned To",
            //     accessor: "assignment.person.user.name",
            //     filterMethod: (filter, row) => 
            //     !!row[filter.id] &&
            //     row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
            // },
            // {
            //     Header: "Expiration",
            //     accessor: "assignment.expiresAt",
            //     filterMethod: (filter, row) => {
            //         if( filter.value === "all") {
            //             return true;
            //         }
            //         if(filter.value === "unassigned")
            //         {
            //             return (!row._original.assignment);
            //         }
            //         const now = moment();
            //         if( filter.value === "expired") {
            //             return !!row._original.assignment && moment(row._original.assignment.expiresAt).isSameOrBefore(moment(), "day")
            //         }
            //         if( filter.value === "unexpired") {
            //             return !!row._original.assignment && moment(row._original.assignment.expiresAt).isAfter()
            //         }
            //         if( filter.value === "3weeks") {
            //             return !!row._original.assignment && moment(row._original.assignment.expiresAt).isAfter() 
            //                 && moment(row._original.assignment.expiresAt).isBefore(moment().add(3,'w'))
            //         }
            //         if( filter.value === "6weeks") {
            //             return !!row._original.assignment && moment(row._original.assignment.expiresAt).isAfter() 
            //                 && moment(row._original.assignment.expiresAt).isBefore(moment().add(6,'w'))
            //         }
            //     },
            //     Filter: ({filter, onChange}) => 
            //         <select onChange={e => onChange(e.target.value)}
            //         style={{width: "100%"}}
            //         value={filter ? filter.value : "all"}
            //         >
            //             <option value="all">Show All</option>
            //             <option value="unassigned">Unassigned</option>
            //             <option value="expired">Expired</option>
            //             <option value="unexpired">All Unexpired</option>
            //             <option value="3weeks">Expiring within 3 weeks</option>
            //             <option value="6weeks">Expiring within 6 weeks</option>
            //         </select>,
            // },
            {
                Header: "Actions",
                headerClassName: "table-actions",
                filterable: false,
                sortable: false,
                resizable: false,
                className: "table-actions",
                Cell: row => (
                    <ListActionsDropdown
                        onRevoke={!!this.props.onRevoke && !!row.original.assignment ? 
                        () => this.props.onRevoke(row.original) : null}
                        onAdd={!!this.props.onAdd && !row.assignment ? 
                        () => this.props.onAdd(row.original) : null}
                        showDetails={!!this.props.showDetails ? 
                        () => this.props.showDetails(row.original) : null}
                        onEdit={!!this.props.onEdit ? 
                        () => this.props.onEdit(row.original) : null}
                />
                ),
            },
            
        ]}
    />
    );
  }
}
