import * as React from "react";

import { IKeySerial } from "../../Types";

interface IProps {
    keySerial: IKeySerial;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
    creating?: boolean;
}

export default class KeySerialEditValues extends React.Component<IProps, {}> {

    public render() {
        const { keySerial } = this.props;
        const numberValue = keySerial ? keySerial.number : "";

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
                            required={true}
                            minLength={1}
                            maxLength={10}
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
