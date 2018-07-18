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
                columns = {[
                    {
                        Header: "Building",
                        accessor: "space.bldgName"
                    },
                    {
                        Header: "Floor",
                        accessor: "space.floorName"
                    },
                    {
                        Header: "Room Number",
                        accessor: "space.roomNumber"
                    },
                    {
                        Header: "Room Name",
                        accessor: "space.roomName"
                    },
                    {
                        Header: "Keys",
                        accessor: "keyCount",
                        Cell: row => (
                            <span><i className="fas fa-key"></i> {row.original.keyCount}</span>
                        )
                    },
                    {
                        Header: "Equipment",
                        accessor: "equipmentCount",
                        Cell: row => (
                            <span><i className="fas fa-laptop"></i> {row.original.equipmentCount}</span>
                        )
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
                        )
                    },
                    {
                        Header: "Actions",
                        filterable: false,
                        sortable: false,
                        Cell: row => (
                            <Button color="secondary" onClick={() => this.props.showDetails(row.original.space)}>
                            View Details
                            </Button>
                        )
                    },
                    
                ]}
            />
        );
    }
}
