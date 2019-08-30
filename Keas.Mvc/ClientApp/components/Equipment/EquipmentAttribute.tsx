import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { IEquipmentAttribute } from "../../Types";

interface IProps {
    attribute: IEquipmentAttribute;
    commonKeys: string[];
    disabledEdit: boolean;
    index: number;
    changeProperty: (i: number, prop: string, val: string) => void;
    onRemove: (i: number) => void;
}

export default class EquipmentAttribute extends React.Component<IProps, {}> {
    public render() {
        return (
            <tbody>
                <tr key={`attribute-${this.props.index}`}>
                    <td>
                        {this.props.disabledEdit && this._renderDisabled()}
                        {!this.props.disabledEdit && this._renderTypeahead()}
                    </td>
                    <td>
                        <input
                            type="text"
                            className="form-control"
                            disabled={this.props.disabledEdit}
                            value={this.props.attribute.value}
                            onChange={e =>
                                this.props.changeProperty(this.props.index, "value", e.target.value)
                            }
                        />
                    </td>
                    {!this.props.disabledEdit && (
                        <td>
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => this.props.onRemove(this.props.index)}
                            >
                                <i className="fas fa-trash" />
                            </button>
                        </td>
                    )}
                </tr>
            </tbody>
        );
    }

    private _renderTypeahead = () => {
        const style =
            !!this.props.attribute.value && !this.props.attribute.key
                ? "form-control is-invalid"
                : "form-control";
        return (
            <Typeahead
                id={`attribute-${this.props.index}`} // for accessibility
                allowNew={false}
                disabled={this.props.disabledEdit}
                options={this.props.commonKeys}
                selected={this.props.attribute.key ? [this.props.attribute.key] : []}
                onChange={selected => {
                    if (selected && selected.length === 1) {
                        this.props.changeProperty(this.props.index, "key", selected[0]);
                    } else {
                        if (!selected || selected && selected.length === 0) {
                            this.props.changeProperty(this.props.index, "key", null);
                        }
                    }

                }}
                emptyLabel='Attribute key not found. Your DA can add.'
                inputProps={{
                    className: style
                }}
            />
        );
    };

    private _renderDisabled = () => {
        return (
            <input
                type="text"
                className="form-control"
                disabled={this.props.disabledEdit}
                value={this.props.attribute.key}
            />
        );
    };
}
