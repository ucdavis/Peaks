import * as React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";

import { Button } from "reactstrap";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

import { IKey } from "../../Types";

interface IProps {
    showDetails?: (key: IKey) => void;
    onEdit?: (key: IKey) => void;
    onDelete?: (key: IKey) => void;

    keys: IKey[];

    filters: any[];
    onFiltersChange: (filters: any[]) => void;
}

interface IState {}

interface IFilter {
    id: string;
    value: any;
}

interface IRow {
    original: IKey;
}

export default class KeyTable extends React.Component<IProps, IState> {
    public render() {
        const { filters, keys } = this.props;

        return (
            <ReactTable
                data={keys}
                filterable={true}
                minRows={1}
                filtered={filters}
                onFilteredChange={this.props.onFiltersChange}
                columns={[
                    {
                        Header: "",
                        headerClassName: "key-details",
                        filterable: false,
                        sortable: false,
                        resizable: false,
                        className: "key-details",
                        Cell: (row: IRow) => (
                            <Button
                                color="link"
                                onClick={() =>
                                    this.props.showDetails(row.original)
                                }
                            >
                                Details
                            </Button>
                        ),
                        maxWidth: 150
                    },
                    {
                        Header: "Key",
                        accessor: "name",
                        className: "word-wrap",
                        filterMethod: (filter: IFilter, row: IRow) =>
                            !!row[filter.id] &&
                            row[filter.id]
                                .toLowerCase()
                                .includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "Key Code",
                        accessor: "code",
                        filterMethod: (filter: IFilter, row: IRow) =>
                            !!row[filter.id] &&
                            row[filter.id]
                                .toLowerCase()
                                .includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "",
                        headerClassName: "table-actions",
                        filterable: false,
                        sortable: false,
                        resizable: false,
                        className: "table-actions",
                        Cell: this.renderAvailableColumn
                    },
                    {
                        Header: "",
                        headerClassName: "table-actions",
                        filterable: false,
                        sortable: false,
                        resizable: false,
                        className: "table-actions",
                        Cell: this.renderSpacesColumn
                    },
                    {
                        Header: "",
                        headerClassName: "table-actions",
                        filterable: false,
                        sortable: false,
                        resizable: false,
                        className: "table-actions",
                        Cell: this.renderDropdownColumn
                    },
                ]}
            />
        );
    }

    private renderAvailableColumn = (row: IRow) => {
        const { serials } = row.original;

        const total = serials.length;
        const available = serials.filter(s => !s.keySerialAssignment).length;

        return (
            <span>
                <i className="fas fa-key"/> {available} / {total}
            </span>
        );
    }

    private renderSpacesColumn = (row: IRow) => {
        const { keyXSpaces } = row.original;

        return (
            <span><i className="fas fa-building mr-2" /> {keyXSpaces.length}</span>
        )
    }

    private renderDropdownColumn = (row: IRow) => {
        const key = row.original;

        const actions: IAction[] = [];

        if (!!this.props.showDetails) {
            actions.push({
                title: "Details",
                onClick: () => this.props.showDetails(key)
            });
        }

        if (!!this.props.onEdit) {
            actions.push({
                title: "Edit",
                onClick: () => this.props.onEdit(key)
            });
        }

        if (!!this.props.onDelete) {
            actions.push({
                title: "Delete",
                onClick: () => this.props.onDelete(key)
            });
        }

        return <ListActionsDropdown actions={actions} />;
    };
}
