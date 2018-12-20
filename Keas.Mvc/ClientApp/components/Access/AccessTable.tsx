import * as moment from "moment";
import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";
import { IAccess } from "../../Types";
import { DateUtil } from "../../util/dates";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";


interface IProps {
    accesses: IAccess[];
    onRevoke?: (access: IAccess) => void;
    onDelete?: (access: IAccess) => void;
    onAdd?: (access: IAccess) => void;
    showDetails?: (access: IAccess) => void;
    onEdit?: (access: IAccess) => void;
}

export default class AccessTable extends React.Component<IProps, {}> {
  public render() {
      return (
        <ReactTable
        data={this.props.accesses}
        filterable={true}
        minRows={1}
        columns = {[
            {
                Cell: row => (
                    <Button color="link" onClick={() => this.props.showDetails(row.original)}>
                    Details
                    </Button>
                ),
                Header: "",
                className: "spaces-details",
                filterable: false,
                headerClassName: "spaces-details",
                maxWidth: 150,
                resizable: false,
                sortable: false,
            },
            {
                Header: "Item",
                accessor: "name",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
            },
            {
                Header: "Number of Assignments",
                accessor: x => x.assignments.length,
                filterable: false,
                id: "numAssignments",
                sortable: true,
            },
            {
                Header: "Assigned To",
                accessor: x => (x.assignments.map(a => a.person.name).join(",")),
                filterMethod: (filter, row) => 
                {
                    const namesAndEmail = row._original.assignments.map(x => x.person.name.toLowerCase() + x.person.email.toLowerCase());
                    if(namesAndEmail.some(x => x.includes(filter.value.toLowerCase())))
                    {
                        return true;
                    }
                },
                id: "assignedTo",
            },
            {
                Filter: ({filter, onChange}) => 
                <select onChange={e => onChange(e.target.value)}
                style={{width: "100%"}}
                value={filter ? filter.value : "all"}
                >
                    <option value="all">Show All</option>
                    <option value="expired">Expired</option>
                    <option value="unexpired">All Unexpired</option>
                    <option value="3weeks">Expiring within 3 weeks</option>
                    <option value="6weeks">Expiring within 6 weeks</option>
                </select>,
                Header: "Expiration",
                accessor: x=> DateUtil.formatFirstExpiration(x.assignments.map(y => y.expiresAt)),
                filterMethod: (filter, row) => {
                    if( filter.value === "all") {
                        return true;
                    }
                    if( filter.value === "expired") {
                        return row.numAssignments > 0 && moment(row.expiresAt,"MM-DD-YYYY").isSameOrBefore()
                    }
                    if( filter.value === "unexpired") {
                        return row.numAssignments > 0 && moment(row.expiresAt,"MM-DD-YYYY").isAfter()
                    }
                    if( filter.value === "3weeks") {
                        return row.numAssignments > 0 && moment(row.expiresAt,"MM-DD-YYYY").isAfter() 
                            && moment(row.expiresAt,"MM-DD-YYYY").isBefore(moment().add(3,'w'))
                    }
                    if( filter.value === "6weeks") {
                        return row.numAssignments > 0 && moment(row.expiresAt,"MM-DD-YYYY").isAfter() 
                            && moment(row.expiresAt,"MM-DD-YYYY").isBefore(moment().add(6,'w'))
                    }
                },
                id: "expiresAt",
                sortMethod: (a, b) => {
                    return moment(a,"MM-DD-YYYY").isSameOrAfter(moment(b,"MM-DD-YYYY")) ? 1 : -1;
                }
            },
            {
                Cell: this.renderDropdownColumn,
                Header: "Actions",
                className: "table-actions",
                filterable: false,
                headerClassName: "table-actions",
                resizable: false,
                sortable: false,
            },
            
        ]}
    />
    );
  }

  private renderDropdownColumn = (row) => {
    const accessEntity: IAccess = row.original;

    const actions: IAction[] = [];

    if (!!this.props.onAdd) {
        actions.push({ title: 'Assign', onClick: () => this.props.onAdd(accessEntity) });
    }

    if (!!this.props.showDetails) {
        actions.push({ title: 'Details', onClick: () => this.props.showDetails(accessEntity) });
    }

    if (!!this.props.onEdit) {
        actions.push({ title: 'Edit', onClick: () => this.props.onEdit(accessEntity) });
    }

    if (!!this.props.onDelete) {
        actions.push({ title: 'Delete', onClick: () => this.props.onDelete(accessEntity) });
    }

    return (
        <ListActionsDropdown actions={actions} />
    );
  }
}
