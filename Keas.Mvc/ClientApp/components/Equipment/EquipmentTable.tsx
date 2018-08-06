import * as moment from "moment";
import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { IEquipment } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    equipment: IEquipment[];
    onRevoke?: (equipment: IEquipment) => void;
    onAdd?: (equipment: IEquipment) => void;
    showDetails?: (equipment: IEquipment) => void;
    onEdit?: (equipment: IEquipment) => void;
}

export default class EquipmentTable extends React.Component<IProps, {}> {
  public render() {
      return (
        <ReactTable
        data={this.props.equipment}
        filterable={true}
        minRows={1}
        columns = {[
            {
                Header: "Serial Number",
                accessor: "serialNumber",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().indexOf(filter.value) !== -1,
            },
            {
                Header: "Name",
                accessor: "name",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().indexOf(filter.value) !== -1,
            },
            {
                Header: "Assigned To",
                accessor: "assignment.person.user.name",
                filterMethod: (filter, row) => 
                !!row[filter.id] &&
                row[filter.id].toLowerCase().indexOf(filter.value) !== -1,
            },
            {
                Header: "Expiration",
                accessor: "assignment.expiresAt",
                filterMethod: (filter, row) => {
                    if( filter.value === "all") {
                        return true;
                    }
                    if(filter.value === "unassigned")
                    {
                        return (!row._original.assignment);
                    }
                    const now = moment();
                    if( filter.value === "expired") {
                        return !!row._original.assignment && moment(row._original.assignment.expiresAt).isSameOrBefore(moment(), "day")
                    }
                    if( filter.value === "unexpired") {
                        return !!row._original.assignment && moment(row._original.assignment.expiresAt).isAfter()
                    }
                    if( filter.value === "3weeks") {
                        return !!row._original.assignment && moment(row._original.assignment.expiresAt).isAfter() 
                            && moment(row._original.assignment.expiresAt).isBefore(moment().add(3,'w'))
                    }
                    if( filter.value === "6weeks") {
                        return !!row._original.assignment && moment(row._original.assignment.expiresAt).isAfter() 
                            && moment(row._original.assignment.expiresAt).isBefore(moment().add(6,'w'))
                    }
                },
                Filter: ({filter, onChange}) => 
                    <select onChange={e => onChange(e.target.value)}
                    style={{width: "100%"}}
                    value={filter ? filter.value : "all"}
                    >
                        <option value="all">Show All</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="expired">Expired</option>
                        <option value="unexpired">All Unexpired</option>
                        <option value="3weeks">Expiring within 3 weeks</option>
                        <option value="6weeks">Expiring within 6 weeks</option>
                    </select>,
            },
            {
                Header: "Actions",
                headerClassName: "actions",
                filterable: false,
                sortable: false,
                resizable: false,
                className: "actions",
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
