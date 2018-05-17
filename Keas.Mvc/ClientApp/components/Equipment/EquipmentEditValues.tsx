import * as React from "react";

import { IEquipment, IEquipmentAttribute, IRoom } from "../../Types";
import AssignRoom from "../Spaces/AssignRoom"
import EquipmentAttributes from "./EquipmentAttributes";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    commonAttributeKeys?: string[];
    disableEditing: boolean;
    selectedEquipment: IEquipment;
    hideName?: boolean;
    updateAttributes?: (attribute: IEquipmentAttribute[]) => void;
}

export default class EquipmentEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                {!this.props.hideName &&
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedEquipment.name ? this.props.selectedEquipment.name : ""}
                        onChange={(e) => this.props.changeProperty("name", e.target.value)}
                    />
                </div>}
                <div className="form-group">
                    <label>Serial Number</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                        onChange={(e) => this.props.changeProperty("serialNumber", e.target.value)}
                    />
                </div>
                {this.props.selectedEquipment.assignment != null &&
                <div>
                <div className="form-group">
                    <label>Assigned To</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedEquipment.assignment.person.user.name}
                        />
                </div>
                <div className="form-group">
                    <label>Expires at</label>
                    <input type="text"
                        className="form-control"
                        disabled={true}
                        value={this.props.selectedEquipment.assignment.expiresAt.toString()}
                        />
                </div>
                </div>
                }
                <div className="form-group">
                    <label>Make</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedEquipment.make ? this.props.selectedEquipment.make : ""}
                        onChange={(e) => this.props.changeProperty("make", e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Model</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={this.props.selectedEquipment.model ? this.props.selectedEquipment.model : ""}
                        onChange={(e) => this.props.changeProperty("model", e.target.value)}
                    />
                </div>
                <EquipmentAttributes 
                    updateAttributes={this.props.updateAttributes}
                    disableEdit={this.props.disableEditing}
                    equipment={this.props.selectedEquipment} 
                    commonKeys={this.props.commonAttributeKeys}
                    />
                {this.props.disableEditing &&
                    <div className="form-group">
                        <label>Room</label>
                        <input type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedEquipment.room ?
                                `${this.props.selectedEquipment.room.roomNumber} ${this.props.selectedEquipment.room.bldgName}` : ""}
                        />
                    </div>
                }
                {!this.props.disableEditing &&
                    <div className="form-group">
                        <label>Room</label>
                        <AssignRoom onSelect={this._selectRoom} defaultRoom={this.props.selectedEquipment.room}/>
                    </div>
                }

            </div>
        );
    }

    private _selectRoom = (room: IRoom) => {
        this.props.changeProperty("room", room);
    } 
}
