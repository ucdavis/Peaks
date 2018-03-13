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
                        onChange={this._changeSerialNumber}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4"><label>Serial Number</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                            onChange={this._changeSerialNumber}
                        />
                    </div>
                </div>
                {this.props.selectedEquipment.assignment != null &&
                    <div className="row">
                        <div className="col-md-4"><label>Expires at</label></div>
                        <div className="col-md-4">
                        <input type="text"
                                disabled={this.props.disableEditing}
                                //value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                                onChange={this._changeSerialNumber}
                            />
                        </div>
                </div>
                }
                <div className="row">
                    <div className="col-md-4"><label>Make</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            //value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                            onChange={this._changeSerialNumber}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4"><label>Model</label></div>
                    <div className="col-md-4">
                        <input type="text"
                            disabled={this.props.disableEditing}
                            //value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                            onChange={this._changeSerialNumber}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private _changeSerialNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        this.props.changeProperty("serialNumber", value);

    }
}
