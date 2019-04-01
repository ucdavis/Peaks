import * as React from "react";
import ReactTable from "react-table";
import { Button } from "reactstrap";
import { IKeySerial } from "../../Types";
import { DateUtil } from "../../util/dates";
import { ReactTableExpirationUtil } from "../../util/reactTable";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

interface IProps {
    keySerials: IKeySerial[];
    onAssign?: (keySerial: IKeySerial) => void;
    onRevoke?: (keySerial: IKeySerial) => void;
    onUpdate?: (keySerial: IKeySerial) => void;
    showDetails?: (keySerial: IKeySerial) => void;
    onEdit?: (keySerial: IKeySerial) => void;
}

interface IFilter {
    id: string;
    value: any;
}

interface IRow {
    original: IKeySerial;
}

export default class KeySerialTable extends React.Component<IProps, {}> {
    public render() {
        const { keySerials } = this.props;

        return (
            <ReactTable
                data={keySerials}
                filterable={true}
                minRows={1}
                columns={[
                    {
                        Cell: (row: IRow) => (
                            <Button
                                color="link"
                                onClick={() => this.props.showDetails(row.original)}
                            >
                                Details
                            </Button>
                        ),
                        Header: "",
                        className: "key-details",
                        filterable: false,
                        headerClassName: "key-details",
                        maxWidth: 150,
                        resizable: false,
                        sortable: false
                    },
                    {
                        Header: "Key Code and SN",
                        accessor: (keySerial: IKeySerial) => {
                            return keySerial.key.code + "-" + keySerial.number;
                        },
                        filterMethod: (filter: IFilter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
                        id: "keyCodeSN"
                    },
                    {
                        Filter: ({ filter, onChange }) => (
                            <select
                                onChange={e => onChange(e.target.value)}
                                style={{ width: "100%" }}
                                value={filter ? filter.value : "all"}
                            >
                                <option value="all">Show All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        ),
                        Header: "Status",
                        accessor: "status",
                        filterMethod: (filter: IFilter, row: IKeySerial) => {
                            if (filter.value === "all") {
                                return true;
                            }
                            if (filter.value === "active") {
                                return row.status === "Active";
                            }
                            if (filter.value === "inactive") {
                                return row.status !== "Active";
                            }
                        }
                    },
                    {
                        Header: "Assignment",
                        accessor: (keySerial: IKeySerial) =>
                            keySerial.keySerialAssignment
                                ? keySerial.keySerialAssignment.person.name
                                : null,
                        className: "word-wrap",
                        filterMethod: (filter: IFilter, row: IRow) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
                        id: "assignedTo"
                    },
                    {
                        Cell: row => (
                            <span>{row.value ? DateUtil.formatExpiration(row.value) : ""}</span>
                        ),
                        Filter: ({ filter, onChange }) => ReactTableExpirationUtil.filter(filter, onChange),
                        Header: "Expiration",
                        accessor: "keySerialAssignment.expiresAt",
                        filterMethod: (filter: IFilter, row) => ReactTableExpirationUtil.filterMethod(filter, row),
                        id: "expiresAt",
                        sortMethod: (a, b) => ReactTableExpirationUtil.sortMethod(a,b)
                    },
                    {
                        Cell: this.renderDropdownColumn,
                        Header: "Actions",
                        className: "table-actions",
                        filterable: false,
                        headerClassName: "table-actions",
                        resizable: false,
                        sortable: false
                    }
                ]}
                defaultSorted={[
                    {
                        desc: false,
                        id: "status"
                    },
                    {
                        desc: false,
                        id: "expiresAt"
                    }
                ]}
            />
        );
    }

    private renderDropdownColumn = (row: IRow) => {
        const keySerial = row.original;

        const actions: IAction[] = [];
        if (!!this.props.onAssign && !keySerial.keySerialAssignment) {
            actions.push({
                onClick: () => this.props.onAssign(keySerial),
                title: "Assign"
            });
        }

        if (!!this.props.onRevoke && !!keySerial.keySerialAssignment) {
            actions.push({
                onClick: () => this.props.onRevoke(keySerial),
                title: "Revoke"
            });
        }

        return <ListActionsDropdown actions={actions} />;
    };
}
