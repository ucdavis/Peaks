import * as React from "react";
import { ListGroupItem } from 'reactstrap';

import { IAccess } from "../../Types";

interface IProps {
    access: IAccess;
    onAssign: (access: IAccess) => void;
}

export default class AssignAccessList extends React.Component<IProps, {}> {
    public render() {
        return (
            <li className="list-group-item" onClick={() => this.props.onAssign(this.props.access)}>
                <i className="fa fa-plus" aria-hidden="true"></i>
                {this.props.access.name}
            </li>
        );
    }
}