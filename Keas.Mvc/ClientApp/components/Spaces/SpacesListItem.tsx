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
                    <td>{this.props.spaceInfo.keyCount}</td>
                    <td>{this.props.spaceInfo.equipmentCount}</td>
                    <td>{this.props.spaceInfo.workstationsTotal}</td>
                    <td>{this.props.spaceInfo.workstationsAvailable}</td>
                    <td>
                        <Button color="secondary" onClick={(e) => this.props.showDetails(this.props.spaceInfo.space)}>
                        View Details
                        </Button>
                    </td>
                </tr>
        );
    }
}
