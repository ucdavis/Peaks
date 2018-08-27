import * as moment from "moment";
import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";
import { IPerson, IPersonInfo } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
    filtered: any[];
    people: IPersonInfo[];
    onRevoke?: (equipment: IPerson) => void;
    onAdd?: (equipment: IPerson) => void;
    showDetails?: (equipment: IPerson) => void;
    onEdit?: (equipment: IPerson) => void;
    updateFilters: (filters: any[]) => void;
}

export default class PeopleTable extends React.Component<IProps, {}> {
  public render() {
      return (
        <ReactTable
        data={this.props.people}
        filterable={true}
        filtered={this.props.filtered}
        onFilteredChange={filtered => this.props.updateFilters(filtered)}
        minRows={1}
        columns = {[
            {
                Header: "Actions",
                headerClassName: "spaces-details",
                filterable: false,
                sortable: false,
                resizable: false,
                className: "spaces-details",
                Cell: row => (
                    <Button color="link" onClick={() => this.props.showDetails(row.original)}>
                    Details
                    </Button>
                ),
                maxWidth: 150,
            },
            {
                Header: "Name",
                accessor: "person.name",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
            },
            {
                Header: "Email",
                accessor: "person.email",
                filterMethod: (filter, row) => 
                    !!row[filter.id] &&
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
            },
            {
                Header: "Keys",
                accessor: "keyCount",
                filterable: false,
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-key"></i> {row.original.keyCount}</span>
                ),
            },
            {
                Header: "Equipment",
                accessor: "equipmentCount",
                filterable: false,
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-hdd"></i> {row.original.equipmentCount}</span>
                ),
            },
            {
                Header: "Accesses",
                accessor: "accessCount",
                filterable: false,
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-address-card"></i> {row.original.accessCount}</span>
                ),
            },
            {
                Header: "Workstations",
                accessor: "workstationCount",
                filterable: false,
                headerClassName: "table-10p",
                className: "table-10p",
                Cell: row => (
                    <span><i className="fas fa-briefcase"></i> {row.original.workstationCount}</span>
                ),
            }
        ]}
    />
    );
  }
}
