import * as React from "react";
import { NavLink } from "react-router-dom";

import { ISpace } from "../../Types";

interface IProps {
    space: ISpace;
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
                    actions
                </td>
            </tr>
        );
    }
}
