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
                <div className="form-group">
                    <label>Serial Number</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedAccess.serialNumber ? this.props.selectedAccess.serialNumber : ""}
                        onChange={(e) => this.props.changeProperty("serialNumber", e.target.value)}
                    />
                </div>
                {this.props.selectedAccess.assignment != null &&
                    <div className="form-group">
                        <label>Expires at</label>
                        <input type="text"
                            className="form-control"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedAccess.assignment.expiresAt ? this.props.selectedAccess.assignment.expiresAt.toString() : ""}
                            />
                    </div>
                }
                <div className="form-group">
                    <label>Make</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedAccess.make ? this.props.selectedAccess.make : ""}
                        onChange={(e) => this.props.changeProperty("make", e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Model</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedAccess.model ? this.props.selectedAccess.model : ""}
                        onChange={(e) => this.props.changeProperty("model", e.target.value)}
                    />
                </div>
            </div>
        );
    }
}
