import * as React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";

import { Button } from "reactstrap";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

import { IKey, IKeyInfo } from "../../Types";

interface IProps {
    showDetails?: (key: IKey) => void;
    onEdit?: (key: IKey) => void;
    onDelete?: (key: IKey) => void;
    keysInfo: IKeyInfo[];
    filters: any[];
    onFiltersChange: (filters: any[]) => void;
}

interface IState {}

interface IFilter {
    id: string;
    value: any;
}

interface IRow {
    original: IKeyInfo;
}

export default class KeyTable extends React.Component<IProps, IState> {
    public render() {
        const { filters, keysInfo } = this.props;

        return (
            <ReactTable
                data={keysInfo}
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
                                    this.props.showDetails(row.original.key)
                                }
                            >
                                Details
                            </Button>
                        ),
                        maxWidth: 150
                    },
                    {
                        Header: "Key",
                        accessor: "key.name",
                        className: "word-wrap",
                        filterMethod: (filter: IFilter, row: IRow) =>
                            !!row[filter.id] &&
                            row[filter.id]
                                .toLowerCase()
                                .includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "Key Code",
                        accessor: "key.code",
                        filterMethod: (filter: IFilter, row: IRow) =>
                            !!row[filter.id] &&
                            row[filter.id]
                                .toLowerCase()
                                .includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "Serials",
                        headerClassName: "table-10p",
                        className: "table-10p",
                        id: "serialsCount",
                        accessor: keyInfo => {
                            return {
                                "serialsInUse": keyInfo.serialsInUseCount,
                                "serialsTotal": keyInfo.serialsTotalCount,
                            }
                        },
                        filterMethod: (filter, row) => {
                            if( filter.value === "all") {
                                return true;
                            }
                            if( filter.value === "unassigned") {
                                return (row.serialsCount.serialsTotal - row.serialsCount.serialsInUse) > 0;
                            }
                            if( filter.value === "assigned") {
                                return row.serialsCount.serialsInUse> 0;
                            }
                            if(filter.value === "any"){
                                return row.serialsCount.serialsTotal > 0;
                            }
                        },
                        Filter: ({filter, onChange}) =>
                            <select onChange={e => onChange(e.target.value)}
                            style={{width: "100%"}}
                            value={filter ? filter.value : "all"}
                            >
                                <option value="all">Show All</option>
                                <option value="unassigned">Unassigned</option>
                                <option value="assigned">Assigned</option>
                                <option value="any">Any</option>
                            </select>,
                        Cell: row => (
                            <span><i className="fas fa-key"/> {row.value.serialsInUse} / {row.value.serialsTotal}</span>
                        ),
                        sortMethod: (a, b) => {
                            if(a.serialsTotal === b.serialsTotal)
                            {
                                if(a.serialsInUse === b.serialsInUse)
                                {
                                    return 0;
                                }
                                else
                                {
                                    return a.serialsInUse < b.serialsInUse? 1 : -1;
                                }
                            }
                            else
                            {
                                return a.serialsTotal < b.serialsTotal ? 1 : -1;
                            }

                        }
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


    private renderSpacesColumn = (row: IRow) => {
        const { keyXSpaces } = row.original.key;

        return (
            <span><i className="fas fa-building mr-2" /> {!!keyXSpaces ? keyXSpaces.length : 0}</span>
        )
    }

    private renderDropdownColumn = (row: IRow) => {
        const key = row.original.key;

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
