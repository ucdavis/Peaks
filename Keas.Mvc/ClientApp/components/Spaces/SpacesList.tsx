import * as React from "react";

import SpacesListItem from "./SpacesListItem";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Button } from "reactstrap";

import { ISpace, ISpaceInfo } from "../../Types";

interface IProps {
    spaces: ISpaceInfo[];
    showDetails: (space: ISpace) => void;
}

export default class SpacesList extends React.Component<IProps, {}> {
    public render() {
        return (
            <ReactTable
                data={this.props.spaces}
                filterable={true}
                minRows={1}
                columns = {[
                    {
                        Header: "Room",
                        accessor: (row) => row.space.roomNumber + " " + row.space.bldgName,
                        id: "room",
                        filterMethod: (filter, row) => {
                            return row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
                        },
                        Cell: row => (
                                <span>{row.original.space.roomNumber} {row.original.space.bldgName}</span>
                            )
                    },
                    // {
                    //     Header: "Floor",
                    //     accessor: "space.floorName"
                    // },
                    // {
                    //     Header: "Room Number",
                    //     accessor: "space.roomNumber"
                    // },
                    {
                        Header: "Room Name",
                        accessor: "space.roomName",
                        filterMethod: (filter, row) => 
                            !!row[filter.id] &&
                            row[filter.id].toLowerCase().indexOf(filter.value) !== -1,
                        Cell: row => (
                            <span>{row.original.space.roomName}</span>
                        ),
                        className: "word-wrap"
                    },
                    {
                        Header: "Keys",
                        accessor: "keyCount",
                        Cell: row => (
                            <span><i className="fas fa-key"></i> {row.original.keyCount}</span>
                        ),
                        maxWidth: 150
                    },
                    {
                        Header: "Equipment",
                        accessor: "equipmentCount",
                        Cell: row => (
                            <span><i className="fas fa-laptop"></i> {row.original.equipmentCount}</span>
                        ),
                        maxWidth: 150
                    },
                    {
                        Header: "Workstations",
                        filterMethod: (filter, row) => {
                            if( filter.value === "all") {
                                return true;
                            }
                            if( filter.value === "available") {
                                return (row._original.workstationsTotal - row._original.workstationsInUse) > 0;
                            }
                        },
                        Filter: ({filter, onChange}) => 
                            <select onChange={e => onChange(e.target.value)}
                            style={{width: "100%"}}
                            value={filter ? filter.value : "all"}
                            >
                                <option value="all">Show All</option>
                                <option value="available">Available</option>
                            </select>,
                        Cell: row => (
                            <span><i className="fas fa-user"></i> {row.original.workstationsInUse} / {row.original.workstationsTotal}</span>
                        ),
                        maxWidth: 150
                    },
                    {
                        Header: "Actions",
                        filterable: false,
                        sortable: false,
                        Cell: row => (
                            <Button color="secondary" onClick={() => this.props.showDetails(row.original.space)}>
                            View Details
                            </Button>
                        ),
                        maxWidth: 150,
                    },
                    
                ]}
            />
        );
    }
}
