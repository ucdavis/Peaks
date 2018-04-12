import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "reactstrap";

import { ISpace } from "../../Types";

interface IProps {
    space: ISpace;
    showDetails: (space: ISpace) => void;
}


export default class SpacesListItem extends React.Component<IProps, {}> {

    public render() {
        return (
                <tr>
                    <td>{this.props.space.room.bldgName}</td>
                    <td>{this.props.space.room.floorName}</td>
                    <td>{this.props.space.room.roomNumber}</td>
                    <td>
                            {this.props.space.room.roomName}
                    </td>
                    <td>
                        <Button color="secondary" onClick={(e) => this.props.showDetails(this.props.space)}>
                        View Details
                        </Button>
                    </td>
                </tr>
        );
    }
}
