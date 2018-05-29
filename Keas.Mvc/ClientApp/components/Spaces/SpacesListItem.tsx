import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "reactstrap";

import { ISpace, ISpaceInfo } from "../../Types";

interface IProps {
    spaceInfo: ISpaceInfo;
    showDetails: (space: ISpace) => void;
}


export default class SpacesListItem extends React.Component<IProps, {}> {

    public render() {
        return (
                <tr>
                    <td>{this.props.spaceInfo.space.bldgName}</td>
                    <td>{this.props.spaceInfo.space.floorName}</td>
                    <td>{this.props.spaceInfo.space.roomNumber}</td>
                    <td>
                            {this.props.spaceInfo.space.roomName}
                    </td>
                    <td><i className="fas fa-key"></i> {this.props.spaceInfo.keyCount}</td>
                    <td><i className="fas fa-laptop"></i> {this.props.spaceInfo.equipmentCount}</td>
                    <td><i className="fas fa-user"></i> {this.props.spaceInfo.workstationsInUse}/{this.props.spaceInfo.workstationsTotal}</td>
                    <td>
                        <Button color="secondary" onClick={(e) => this.props.showDetails(this.props.spaceInfo.space)}>
                        View Details
                        </Button>
                    </td>
                </tr>
        );
    }
}
