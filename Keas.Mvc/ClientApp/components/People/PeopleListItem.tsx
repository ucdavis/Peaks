import * as React from "react";
import { NavLink } from "react-router-dom";

import { IPerson } from "../../Types";

interface IProps {
    person: IPerson;
    teamName: string;
}


export default class PeopleListItem extends React.Component<IProps, {}> {

    public render() {
        const personUrl = `/${this.props.teamName}/person/details/${this.props.person.id}`
        return (
            <div>
                <NavLink to={personUrl}>{this.props.person.name}</NavLink>
            </div>
        );
    }
}
