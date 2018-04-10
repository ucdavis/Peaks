import * as React from "react";
import { NavLink } from "react-router-dom";

import { ISpace } from "../../Types";

interface IProps {
    space: ISpace;
}


export default class SpacesListItem extends React.Component<IProps, {}> {

    public render() {
        //const personUrl = `/${this.props.teamName}/person/details/${this.props.person.id}`
        return (
            <div>
                <NavLink to="/">{this.props.space.room.roomKey}</NavLink>
            </div>
        );
    }
}
