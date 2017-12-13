import * as React from "react";

import { IAccess } from "../../Types";

interface IProps {
    access: IAccess;
    onAssign: (access: IAccess) => void;
}

export default class AssignAccessList extends React.Component<IProps, {}> {
    public render() {
        return (
            <tr>
                <td>
                    <i className="fa fa-plus" aria-hidden="true" onClick={() => this.props.onAssign(this.props.access)}></i>
                </td>
                <td>
                    {this.props.access.name}
                </td>
            </tr>
        );
    }
}