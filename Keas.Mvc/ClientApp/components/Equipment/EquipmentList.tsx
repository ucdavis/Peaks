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

export default class EquipmentList extends React.Component<IProps, {}> {
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
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().indexOf(filter.value) !== -1,
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
