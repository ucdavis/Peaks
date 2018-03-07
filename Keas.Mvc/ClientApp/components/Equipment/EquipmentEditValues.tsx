import * as React from "react";

import { IEquipment } from "../../Types";

interface IProps {
    selectedEquipment: IEquipment;
    changeProperty: (property: string, value: string) => void;
}

export default class EquipmentEditValues extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                <div className="form-group">
                    <label>Serial Number</label>
                    <input type="text"
                        value={this.props.selectedEquipment.serialNumber ? this.props.selectedEquipment.serialNumber : ""}
                        onChange={this._changeSerialNumber}
                    />
                </div>
            </div>
        );
    }

    private _changeSerialNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        this.props.changeProperty("serialNumber", value);

    }
}
