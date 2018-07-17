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
                        accessor: "keyCount"
                    },
                    {
                        Header: "Equipment",
                        accessor: "equipmentCount"
                    },
                    {
                        Header: "Workstations",
                        accessor: "workstationsInUse"
                    },
                    {
                        Header: "Actions",
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
