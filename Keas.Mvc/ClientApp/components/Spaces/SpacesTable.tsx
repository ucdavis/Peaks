import * as React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";

import { ISpace, ISpaceInfo } from "../../Types";

interface IProps {
    filtered: any[];
    spaces: ISpaceInfo[];
    showDetails: (space: ISpace) => void;
    updateFilters: (filters: any[]) => void;
}

export default class SpacesTable extends React.Component<IProps, {}> {
    constructor(props) {
        super(props);

        this.state = {
            filtered: []
        };
    }
    public render() {
        return (
            <ReactTable
                data={this.props.spaces}
                filterable={true}
                minRows={1}
                filtered={this.props.filtered}
                onFilteredChange={filtered => this.props.updateFilters(filtered)}
                columns = {[
                    {
                        Header: "Actions",
                        headerClassName: "spaces-details",
                        filterable: false,
                        sortable: false,
                        resizable: false,
                        className: "spaces-details",
                        Cell: row => (
                            <Button color="link" onClick={() => this.props.showDetails(row.original.space)}>
                            Details
                            </Button>
                        ),
                        maxWidth: 150,
                    },
                    {
                        Header: "Room",
                        accessor: (row) => row.space.roomNumber + " " + row.space.bldgName,
                        id: "room",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] && row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
                        ,
                        Cell: row => (
                                <span>{row.original.space.roomNumber} {row.original.space.bldgName}</span>
                            )
                    },
                    {
                        Header: "Room Name",
                        accessor: "space.roomName",
                        filterMethod: (filter, row) =>
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
                        Cell: row => (
                            <span>{row.original.space.roomName}</span>
                        ),
                        className: "word-wrap"
                    },
                    {
                        Header: "Keys",
                        accessor: "keyCount",
                        headerClassName: "table-10p",
                        className: "table-10p",
                        filterable: false,
                        Cell: row => (
                            <span><i className="fas fa-key"/> {row.original.keyCount}</span>
                        ),
                    },
                    {
                        Header: "Equipment",
                        accessor: "equipmentCount",
                        headerClassName: "table-10p",
                        className: "table-10p",
                        filterable: false,
                        Cell: row => (
                            <span><i className="fas fa-hdd"/> {row.original.equipmentCount}</span>
                        ),
                    },
                    {
                        Header: "Workstations",
                        headerClassName: "table-10p",
                        className: "table-10p",
                        id: "workstationsCount",
                        accessor: spaceInfo => {
                            return {
                                "workstationsInUse": spaceInfo.workstationsInUse,
                                "workstationsTotal": spaceInfo.workstationsTotal
                            }
                        },
                        filterMethod: (filter, row) => {
                            if( filter.value === "all") {
                                return true;
                            }
                            if( filter.value === "unassigned") {
                                return (row.workstationsCount.workstationsTotal - row.workstationsCount.workstationsInUse) > 0;
                            }
                            if( filter.value === "assigned") {
                                return row.workstationsCount.workstationsInUse> 0;
                            }
                            if(filter.value === "any"){
                                return row.workstationsCount.workstationsTotal > 0;
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
                            <span><i className="fas fa-user"/> {row.value.workstationsInUse} / {row.value.workstationsTotal}</span>
                        ),
                        sortMethod: (a, b) => {
                            if(a.workstationsTotal === b.workstationsTotal)
                            {
                                if(a.workstationsInUse === b.workstationsInUse)
                                {
                                    return 0;
                                }
                                else
                                {
                                    return a.workstationsInUse < b.workstationsInUse? 1 : -1;
                                }
                            }
                            else
                            {
                                return a.workstationsTotal < b.workstationsTotal ? 1 : -1;
                            }

                        }
                    },


                ]}
            />
        );
    }
}
