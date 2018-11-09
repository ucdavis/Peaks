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
                    />
                </div>
                <div className="form-group">
                    <label>Code</label>
                    <input type="text"
                        className="form-control"
                        disabled={this.props.disableEditing}
                        value={code}
                        onChange={this.onChangeCode}
                    />
                </div>
            </div>
        );
    }

    private onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.changeProperty("name", event.target.value)
    }

    private onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.changeProperty("code", event.target.value)
    }
}
