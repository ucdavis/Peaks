import * as React from "react";

import { ISpace, IWorkstation } from "../../Types";
import AssignSpace from "../Spaces/AssignSpace";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    commonAttributeKeys?: string[];
    disableEditing: boolean;
    selectedWorkstation: IWorkstation;
    creating?: boolean;
}

export default class WorkstationEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                {!this.props.creating &&
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedWorkstation.name ? this.props.selectedWorkstation.name : ""}
                        onChange={(e) => this.props.changeProperty("name", e.target.value)}
                    />
                </div>}
                {this.props.selectedWorkstation.assignment != null &&
                <div>
                <div className="form-group">
                    <label>Assigned To</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedWorkstation.assignment.person.user.name}
                        />
                </div>
                <div className="form-group">
                    <label>Expires at</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedWorkstation.assignment.expiresAt.toString()}
                        />
                </div>
                </div>
                }
                {this.props.disableEditing &&
                    <div className="form-group">
                        <label>Room</label>
                        <input type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedWorkstation.space ?
                                `${this.props.selectedWorkstation.space.roomNumber} ${this.props.selectedWorkstation.space.bldgName}` : ""}
                        />
                    </div>
                }
                {!this.props.disableEditing &&
                    <div className="form-group">
                        <label>Room</label>

                <AssignSpace onSelect={this._selectSpace} defaultSpace={this.props.selectedWorkstation.space} />
                    </div>}
              

            </div>
        );
    }

    private _selectSpace = (space: ISpace) => {
        this.props.changeProperty("space", space);
    } 
}
