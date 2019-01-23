import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";
import { IPerson, IPersonInfo } from "../../Types";

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
                columns={[
                    {
                        Cell: row => (
                            <Button
                                color="link"
                                onClick={() => this.props.showDetails(row.original)}
                            >
                                Details
                            </Button>
                        ),
                        Header: "Actions",
                        className: "spaces-details",
                        filterable: false,
                        headerClassName: "spaces-details",
                        maxWidth: 150,
                        resizable: false,
                        sortable: false
                    },
                    {
                        Header: "Name",
                        accessor: "person.name",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "Email",
                        accessor: "person.email",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                    },
                    {
                        Cell: row => <span>{row.original.keyCount}</span>,
                        Header: "Keys",
                        accessor: "keyCount",
                        className: "table-10p",
                        filterable: false,
                        headerClassName: "table-10p"
                    },
                    {
                        Cell: row => <span>{row.original.equipmentCount}</span>,
                        Header: "Equipment",
                        accessor: "equipmentCount",
                        className: "table-10p",
                        filterable: false,
                        headerClassName: "table-10p"
                    },
                    {
                        Cell: row => <span>{row.original.accessCount}</span>,
                        Header: "Accesses",
                        accessor: "accessCount",
                        className: "table-10p",
                        filterable: false,
                        headerClassName: "table-10p"
                    },
                    {
                        Cell: row => <span>{row.original.workstationCount}</span>,
                        Header: "Workstations",
                        accessor: "workstationCount",
                        className: "table-10p",
                        filterable: false,
                        headerClassName: "table-10p"
                    }
                ]}
            />
        );
    }
}
