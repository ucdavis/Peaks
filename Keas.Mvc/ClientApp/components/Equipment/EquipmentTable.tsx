import * as moment from "moment";
import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";
import { IEquipment } from "../../Types";
import { DateUtil } from "../../util/dates";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

interface IProps {
    equipment: IEquipment[];
    onRevoke?: (equipment: IEquipment) => void;
    onDelete?: (equipment: IEquipment) => void;
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
                        Header: "",
                        className: "spaces-details",
                        filterable: false,
                        headerClassName: "spaces-details",
                        maxWidth: 150,
                        resizable: false,
                        sortable: false
                    },
                    {
                        Header: "Serial Number",
                        accessor: "serialNumber",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "Item",
                        accessor: "name",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                    },
                    {
                        Header: "Assigned To",
                        accessor: "assignment.person.name",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                    },
                    {
                        Filter: ({ filter, onChange }) => (
                            <select
                                onChange={e => onChange(e.target.value)}
                                style={{ width: "100%" }}
                                value={filter ? filter.value : "all"}
                            >
                                <option value="all">Show All</option>
                                <option value="unassigned">Unassigned</option>
                                <option value="expired">Expired</option>
                                <option value="unexpired">All Unexpired</option>
                                <option value="3weeks">Expiring within 3 weeks</option>
                                <option value="6weeks">Expiring within 6 weeks</option>
                            </select>
                        ),
                        Header: "Expiration",
                        accessor: x => DateUtil.formatAssignmentExpiration(x.assignment),
                        filterMethod: (filter, row) => {
                            if (filter.value === "all") {
                                return true;
                            }
                            if (filter.value === "unassigned") {
                                return !row._original.assignment;
                            }
                            if (filter.value === "expired") {
                                return (
                                    !!row._original.assignment &&
                                    moment(row._original.assignment.expiresAt).isSameOrBefore()
                                );
                            }
                            if (filter.value === "unexpired") {
                                return (
                                    !!row._original.assignment &&
                                    moment(row._original.assignment.expiresAt).isAfter()
                                );
                            }
                            if (filter.value === "3weeks") {
                                return (
                                    !!row._original.assignment &&
                                    moment(row._original.assignment.expiresAt).isAfter() &&
                                    moment(row._original.assignment.expiresAt).isBefore(
                                        moment().add(3, "w")
                                    )
                                );
                            }
                            if (filter.value === "6weeks") {
                                return (
                                    !!row._original.assignment &&
                                    moment(row._original.assignment.expiresAt).isAfter() &&
                                    moment(row._original.assignment.expiresAt).isBefore(
                                        moment().add(6, "w")
                                    )
                                );
                            }
                        },
                        id: "assignment.expiresAt"
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
            />
        );
    }

    private renderDropdownColumn = row => {
        const equipmentEntity: IEquipment = row.original;
        const hasAssignment = !!equipmentEntity.assignment;

        const actions: IAction[] = [];

        if (!!this.props.onAdd && !hasAssignment) {
            actions.push({ title: "Add", onClick: () => this.props.onAdd(equipmentEntity) });
        }

        if (!!this.props.onRevoke && hasAssignment) {
            actions.push({ title: "Revoke", onClick: () => this.props.onRevoke(equipmentEntity) });
        }

        if (!!this.props.onDelete) {
            actions.push({ title: "Delete", onClick: () => this.props.onDelete(equipmentEntity) });
        }

        return <ListActionsDropdown actions={actions} />;
    };
}
