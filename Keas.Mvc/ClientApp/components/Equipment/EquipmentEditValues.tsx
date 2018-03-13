import * as React from "react";

import { IEquipment } from "../../Types";

interface IProps {
    selectedEquipment: IEquipment;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
}

export default class EquipmentEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-4"><label>Name</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={true}
                            value={this.props.selectedEquipment.name ? this.props.selectedEquipment.name : ""}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4"><label>Serial Number</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                            onChange={(e) => this.props.changeProperty("serialNumber", e.target.value)}
                        />
                    </div>
                </div>
                {this.props.selectedEquipment.assignment != null &&
                    <div className="row">
                        <div className="col-md-4"><label>Expires at</label></div>
                        <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedEquipment.assignment.expiresAt ? this.props.selectedEquipment.assignment.expiresAt.toString() : ""}
                            />
                        </div>
                </div>
                }
                <div className="row">
                    <div className="col-md-4"><label>Make</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedEquipment.make ? this.props.selectedEquipment.make : ""}
                            onChange={(e) => this.props.changeProperty("make", e.target.value)}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4"><label>Model</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedEquipment.model ? this.props.selectedEquipment.model : ""}
                            onChange={(e) => this.props.changeProperty("model", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
