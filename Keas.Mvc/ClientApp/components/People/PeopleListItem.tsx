import * as React from "react";
import { NavLink } from "react-router-dom";

import { IPerson } from "../../Types";

interface IProps {
    personName: string;
    personId: number;
    teamName: number;
}


export default class PeopleListItem extends React.Component<IProps, {}> {

    public render() {
        const personUrl = `/${this.props.teamName}/person/details/${this.props.personId}`
        return (
            <div>
                <NavLink to={personUrl}>{this.props.personName}</NavLink>
            </div>
        );
    }
}
