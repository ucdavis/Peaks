import * as React from "react";

import { IAccess } from "../../Types";

interface IProps {
    selectedAccess: IAccess;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
}

export default class AccessEditValues extends React.Component<IProps, {}> {

    public render() {
        const assignments = this.props.selectedAccess.assignments.length > 0 ? this.props.selectedAccess.assignments.map(x =>
            <div key={x.id} >
                <div className="form-group">
                    <label>Assigned To</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={x.person.user.name}
                    />
                </div>
                <div className="form-group">
                    <label>Expires At</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={x.expiresAt.toString()}
                    />
                </div>
            </div>) : "";

        return (
            <div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedAccess.name ? this.props.selectedAccess.name : ""}
                    />
                </div>
                {assignments}
            </div>
        );
    }
}
