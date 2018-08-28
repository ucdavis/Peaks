import * as React from "react";

import { IEquipment, IEquipmentAttribute, ISpace } from "../../Types";
import AssignSpace from "../Spaces/AssignSpace";
import SearchTags from "../Tags/SearchTags";
import EquipmentAttributes from "./EquipmentAttributes";

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    commonAttributeKeys?: string[];
    creating?: boolean;
    disableEditing: boolean;
    selectedEquipment: IEquipment;
    space?: ISpace;
    tags?: string[];
    updateAttributes?: (attribute: IEquipmentAttribute[]) => void;
}

export default class EquipmentEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                {!this.props.creating &&
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
                        autoFocus={!this.props.disableEditing && this.props.creating}
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
                        value={this.props.selectedEquipment.assignment.person.name}
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

                <div className="form-group">
                    <label>Tags</label>
                    <SearchTags 
                        tags={this.props.tags} 
                        disabled={this.props.disableEditing}
                        selected={!!this.props.selectedEquipment.tags ? this.props.selectedEquipment.tags.split(",") : []}
                        onSelect={(e) => this.props.changeProperty("tags", e.join(","))} />
                </div>

                {this.props.disableEditing &&
                    // if we are looking at details, or if we are assigning
                    <div className="form-group">
                        <label>Room</label>
                        <input type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.selectedEquipment.space ?
                                `${this.props.selectedEquipment.space.roomNumber} ${this.props.selectedEquipment.space.bldgName}` : ""}
                        />
                    </div>
                }
                {!this.props.disableEditing &&
                    // if we are editing or creating 
                    <div className="form-group">
                        <label>Room</label>
                    <AssignSpace
                        onSelect={this._selectSpace} 
                        defaultSpace={this.props.space ? this.props.space : this.props.selectedEquipment.space} />
                    </div>}
            </div>
        );
    }

    private _selectSpace = (space: ISpace) => {
        this.props.changeProperty("space", space);
    } 
}
