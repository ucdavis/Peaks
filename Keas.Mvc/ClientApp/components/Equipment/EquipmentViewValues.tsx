import * as React from "react";

import { IEquipment } from "../../Types";

interface IProps {
    selectedEquipment: IEquipment;
}

export default class EquipmentViewValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-4"><label>Name</label></div>
                    <div className="col-md-4">{this.props.selectedEquipment.name}</div>
                </div>
                <div className="row">
                    <div className="col-md-4"><label>Serial Number</label></div>
                    <div className="col-md-4">{this.props.selectedEquipment.serialNumber}</div>
                </div>
                {this.props.selectedEquipment.assignment != null &&
                    <div className="row">
                        <div className="col-md-4"><label>Expires at</label></div>
                        <div className="col-md-4">{this.props.selectedEquipment.assignment.expiresAt}</div>
                    </div>
                }
                <div className="row">
                    <div className="col-md-4"><label>Make</label></div>
                    <div className="col-md-4">{this.props.selectedEquipment.make}</div>
                </div>
                <div className="row">
                    <div className="col-md-4"><label>Model</label></div>
                    <div className="col-md-4">{this.props.selectedEquipment.model}</div>
                </div>
            </div>
        );
    }
}
