import * as React from "react";

import { IKeySerial } from "../../Types";

interface IProps {
    selectedKeySerial: IKeySerial;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    creating?: boolean;
}

export default class KeySerialEditValues extends React.Component<IProps, {}> {

    public render() {
        const { selectedKeySerial } = this.props;
        const numberValue = selectedKeySerial ? selectedKeySerial.number : "";

        return (
            <div>
                {!this.props.creating &&
                    <div className="form-group">
                        <label>Number</label>
                        <input type="text"
                            className="form-control"
                            disabled={this.props.disableEditing}
                            value={numberValue}
                            onChange={this.onChangeNumber}
                        />
                    </div>
                }
            </div>
        );
    }

    private onChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.changeProperty("number", event.target.value)
    }
}
