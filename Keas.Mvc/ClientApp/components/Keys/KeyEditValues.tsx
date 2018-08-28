import * as React from "react";

import { IKey } from "../../Types";

interface IProps {
    selectedKey: IKey;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    creating?: boolean;
}

export default class KeyEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                {!this.props.creating &&
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedKey.name ? this.props.selectedKey.name : ""}
                        onChange={(e) => this.props.changeProperty("name", e.target.value)}
                    />
                </div>}
                <div className="form-group">
                    <label>Serial Number</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing || !this.props.creating}
                        autoFocus={!this.props.disableEditing && this.props.creating}
                        value={this.props.selectedKey.serialNumber ? this.props.selectedKey.serialNumber : ""}
                        onChange={(e) => this.props.changeProperty("serialNumber", e.target.value)}
                    />
                </div>
                {this.props.selectedKey.assignment != null &&
                <div>
                    <div className="form-group">
                        <label>Assigned To</label>
                        <input type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedKey.assignment.person ? this.props.selectedKey.assignment.person.name : ""}
                            />
                    </div>
                    <div className="form-group">
                        <label>Expires at</label>
                        <input type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedKey.assignment.expiresAt ? this.props.selectedKey.assignment.expiresAt.toString() : ""}
                            />
                    </div>
                </div>
                }
            </div>
        );
    }
}
