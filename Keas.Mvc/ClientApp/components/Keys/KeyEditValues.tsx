import * as React from "react";

import { IKey } from "../../Types";

interface IProps {
    selectedKey: IKey;
    disableEditing: boolean;
    changeProperty?: (property: string, value: string) => void;
}

export default class KeyEditValues extends React.Component<IProps, {}> {

    public render() {
        const { name, code } = this.props.selectedKey;

        return (
            <div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={name}
                        onChange={this.onChangeName}
                        required={true}
                        minLength={1}
                    />
                </div>
                <div className="form-group">
                    <label>Code</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={code}
                        onChange={this.onChangeCode}
                        required={true}
                        minLength={1}
                        maxLength={10}
                    />
                </div>
            </div>
        );
    }

    private onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.changeProperty("name", event.target.value)
    }

    private onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // use upper
        value = value.toUpperCase();

        this.props.changeProperty("code", value)
    }
}
