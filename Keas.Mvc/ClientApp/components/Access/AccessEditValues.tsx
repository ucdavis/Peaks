import * as React from "react";

import { IAccess } from "../../Types";

interface IProps {
    selectedAccess: IAccess;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
}

export default class AccessEditValues extends React.Component<IProps, {}> {

    public render() {
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

            </div>
        );
    }
}
