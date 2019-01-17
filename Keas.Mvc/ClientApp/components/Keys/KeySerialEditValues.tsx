import * as React from "react";
import { Button } from "reactstrap";
import { IKeySerial } from "../../Types";

interface IProps {
    keySerial: IKeySerial;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    creating?: boolean;
    openEditModal?: (keySerial: IKeySerial) => void;
}

export default class KeySerialEditValues extends React.Component<IProps, {}> {
    public render() {
        const { keySerial } = this.props;

        const numberValue = keySerial ? keySerial.number : "";
        const statusValue = keySerial ? keySerial.status : "Active";

        return (
            <div>
                {this.props.disableEditing && this.props.openEditModal &&
                <Button color="link" onClick={() => this.props.openEditModal(keySerial)}>
                    <i className="fas fa-edit fa-xs" /> Edit Serial
                </Button>}
                <div className="wrapperasset">
                    <div className="form-group">
                        <label>Key Name</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.keySerial.key.name}
                        />
                    </div>
                    <div className="form-group">
                        <label>Key Code</label>
                        <input
                            type="text"
                            className="form-control"
                            disabled={true}
                            value={this.props.keySerial.key.code}
                        />
                    </div>
                    {!this.props.creating && (
                        <div className="form-group">
                            <label>Serial Number</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={this.props.disableEditing}
                                value={numberValue}
                                onBlur={this.onBlurNumber}
                                onChange={this.onChangeNumber}
                                required={true}
                                minLength={1}
                                maxLength={10}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            className="form-control"
                            value={statusValue}
                            onChange={this.onChangeStatus}
                            disabled={this.props.disableEditing}
                        >
                            <option value="Active">Active</option>
                            <option value="Lost">Lost</option>
                            <option value="Destroyed">Destroyed</option>
                            <option value="Dog ate">Dog ate</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    private onBlurNumber = () => {
        let value = this.props.keySerial.number;
        value = value.trim();

        this.props.changeProperty("number", value);
    };

    private onChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.changeProperty("number", event.target.value);
    };

    private onChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.changeProperty("status", event.target.value);
    };
}
