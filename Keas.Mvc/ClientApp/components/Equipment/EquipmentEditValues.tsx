import * as React from "react";
import { Button, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { IEquipment, IEquipmentAttribute, ISpace } from "../../Types";
import SearchSpaces from "../Spaces/SearchSpaces";
import SearchTags from "../Tags/SearchTags";
import EquipmentAttributes from "./EquipmentAttributes";
import EquipmentBigFix from "./EquipmentBigFix"

interface IProps {
    changeProperty?: (property: string, value: any) => void;
    commonAttributeKeys?: string[];
    equipmentTypes?: string[];
    disableEditing: boolean;
    selectedEquipment: IEquipment;
    space?: ISpace;
    tags?: string[];
    updateAttributes?: (attribute: IEquipmentAttribute[]) => void;
    openEditModal?: (equipment: IEquipment) => void; // if disableEditing is true, this needs to be supplied
}

export default class EquipmentEditValues extends React.Component<IProps, {}> {
    public render() {
        const typeValue = this.props.selectedEquipment.type || "Default";
        const listItems = !!this.props.equipmentTypes ? this.props.equipmentTypes.map((x) =>
            <option value={x} key={x}>{x}</option>
        ) :
            <option value={typeValue}>{typeValue}</option>;
        return (
            <div>
                {this.props.disableEditing && this.props.openEditModal && (
                  <div className="row justify-content-between">
                    <h3>Equipment Details</h3>
                    <Button
                        color="link"
                        onClick={() => this.props.openEditModal(this.props.selectedEquipment)}
                    >
                        <i className="fas fa-edit fa-xs" /> Edit Equipment
                    </Button>
                  </div>
                )}

                <div className="wrapperasset">
                    <FormGroup>
                        <Label for="item">Item</Label>
                        <Input
                            type="text"
                            className="form-control"
                            disabled={this.props.disableEditing}
                            value={
                                this.props.selectedEquipment.name
                                    ? this.props.selectedEquipment.name
                                    : ""
                            }
                            onChange={e => this.props.changeProperty("name", e.target.value)}
                            invalid={!this.props.selectedEquipment.name}
                        />
                        <FormFeedback>Item name is required</FormFeedback>
                    </FormGroup>
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            className="form-control"
                            value={typeValue}
                            onChange={e => this.props.changeProperty("type", e.target.value)}
                            disabled={this.props.disableEditing}
                        >
                            {listItems}
                        </select>

                    </div>
                    <div className="form-group">
                        <label>Serial Number / Identifier</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={this.props.disableEditing}
                            autoFocus={
                                !this.props.disableEditing &&
                                this.props.selectedEquipment.name !== ""
                            }
                            value={
                                this.props.selectedEquipment.serialNumber
                                    ? this.props.selectedEquipment.serialNumber
                                    : ""
                            }
                            onChange={e =>
                                this.props.changeProperty("serialNumber", e.target.value)
                            }
                        />
                    </div>
                    {this._shouldShowForType(this.props.selectedEquipment.type, "ProtectionAndAvailability") &&
                        <div>
                            <div className="form-group">
                            <label>Protection Level</label> <span> </span> <a href="https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html" target="_blank"><i className="fas fa-info-circle"></i></a>
                                <select
                                    className="form-control"
                                    value={this.props.selectedEquipment.protectionLevel || ""}
                                    onChange={e => this.props.changeProperty("protectionLevel", e.target.value)}
                                    disabled={this.props.disableEditing}
                                >
                                    <option value="P1">P1 - Minimal</option>
                                    <option value="P2">P2 - Low</option>
                                    <option value="P3">P3 - Moderate</option>
                                    <option value="P4">P4 - High</option>
                                </select>
                            </div>
                            <div className="form-group">
                            <label>Availability Level</label>  <span> </span> <a href="https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html" target="_blank"><i className="fas fa-info-circle"></i></a>
                                <select
                                    className="form-control"
                                    value={this.props.selectedEquipment.availabilityLevel || ""}
                                    onChange={e => this.props.changeProperty("availabilityLevel", e.target.value)}
                                    disabled={this.props.disableEditing}
                                >
                                    <option value="A1">A1 - Minimal</option>
                                    <option value="A2">A2 - Low</option>
                                    <option value="A3">A3 - Moderate</option>
                                    <option value="A4">A4 - High</option>
                                </select>
                            </div>
                        </div>
                    }

                    {this._shouldShowForType(this.props.selectedEquipment.type, "Make") && (
                        <div className="form-group">
                            <label>Make</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={this.props.disableEditing}
                                value={
                                    this.props.selectedEquipment.make
                                        ? this.props.selectedEquipment.make
                                        : ""
                                }
                                onChange={e => this.props.changeProperty("make", e.target.value)}
                            />
                        </div>
                    )}
                    {this._shouldShowForType(this.props.selectedEquipment.type, "Model") && (
                        <div className="form-group">
                            <label>Model</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={this.props.disableEditing}
                                value={
                                    this.props.selectedEquipment.model
                                        ? this.props.selectedEquipment.model
                                        : ""
                                }
                                onChange={e => this.props.changeProperty("model", e.target.value)}
                            />
                        </div>
                    )}
                    {this._shouldShowForType(this.props.selectedEquipment.type, "SystemManagementId") && (
                        <div className="form-group">
                            <EquipmentBigFix
                               bigfixId={this.props.selectedEquipment.systemManagementId}
                               addBigFixId={this.props.changeProperty}
                               disableEditing={this.props.disableEditing}
                           />
                            <input
                                type="text"
                                className="form-control"
                                disabled={this.props.disableEditing}
                                value={this.props.selectedEquipment.systemManagementId || ""}
                                maxLength={16}
                                onChange={e => this.props.changeProperty("systemManagementId", e.target.value)}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            className="form-control"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedEquipment.notes || ""}
                            onChange={e => this.props.changeProperty("notes", e.target.value)}
                        />
                    </div>
                    <EquipmentAttributes
                        updateAttributes={this.props.updateAttributes}
                        disableEdit={this.props.disableEditing}
                        attributes={this.props.selectedEquipment.attributes}
                        commonKeys={this.props.commonAttributeKeys}
                    />

                    <div className="form-group">
                        <label>Tags</label>
                        <SearchTags
                            tags={this.props.tags}
                            disabled={this.props.disableEditing}
                            selected={
                                !!this.props.selectedEquipment.tags
                                    ? this.props.selectedEquipment.tags.split(",")
                                    : []
                            }
                            onSelect={e => this.props.changeProperty("tags", e.join(","))}
                        />
                    </div>

                    {this.props.disableEditing && (
                        // if we are looking at details, or if we are assigning
                        <div className="form-group">
                            <label>Room</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={true}
                                value={
                                    this.props.selectedEquipment.space
                                        ? `${this.props.selectedEquipment.space.roomNumber} ${
                                        this.props.selectedEquipment.space.bldgName
                                        }`
                                        : ""
                                }
                            />
                        </div>
                    )}
                    {!this.props.disableEditing && (
                        // if we are editing or creating
                        <div className="form-group">
                            <label>Room</label>
                            <SearchSpaces
                                onSelect={this._selectSpace}
                                defaultSpace={
                                    this.props.space
                                        ? this.props.space
                                        : this.props.selectedEquipment.space
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private _selectSpace = (space: ISpace) => {
        this.props.changeProperty("space", space);
    };

    private _shouldShowForType(type: string, prop: string) {
        if (prop === "Make") {
            if (type !== "Card" && type !== "Software") {
                return true;
            }
            return false;
        }
        if (prop === "Model") {
            if (type !== "Card" && type !== "Software") {
                return true;
            }
            return false;
        }
        if (prop === "ProtectionAndAvailability") {
            let Types = ["Computer", "Desktop", "Laptop", "Server", "Cellphone", "Device", "Tablet"];
            if (Types.indexOf(type) > -1) {
                return true;
            }
            return false;
        }

        if (prop === "SystemManagementId") {
            let Types = ["Computer", "Desktop", "Laptop", "Server"];
            if (Types.indexOf(type) > -1) {
                return true;
            }
            return false;
        }

        return true;
    };
}
