import * as React from "react";
import { Button } from "reactstrap";
import { IEquipment, IEquipmentAttribute } from "../../Types";
import EquipmentAttribute from "./EquipmentAttribute";

interface IProps {
    commonKeys: string[];
    disableEdit: boolean;
    attributes: IEquipmentAttribute[];
    updateAttributes: (attribute: IEquipmentAttribute[]) => void;
}

export default class EquipmentAttributes extends React.Component<IProps, {}> {
    public render() {
        const attributeList = this.props.attributes.map((attr, i) => (
            <EquipmentAttribute
                key={`attr-${i}`}
                disabledEdit={this.props.disableEdit}
                commonKeys={this.props.commonKeys}
                attribute={attr}
                index={i}
                changeProperty={this._onEditAttribute}
                onRemove={this._onRemoveAttribute}
            />
        ));
        return (
            <div>
                <label>Atrributes</label>
                <table className="table table-borderless">
                    <thead>
                        <tr>
                            <td>Key</td>
                            <td>Value</td>
                            {!this.props.disableEdit && <td>Remove</td>}
                        </tr>
                    </thead>
                    {attributeList}
                    {!this.props.disableEdit && (
                        <tfoot>
                            <tr>
                                <td colSpan={3}>
                                    <Button
                                        className="btn btn-link"
                                        id="add-new"
                                        onClick={this._onAddAttribute}
                                    >
                                        <i className="fas fa-plus fa-sm" aria-hidden="true" /> Add
                                        New
                                    </Button>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        );
    }

    private _onAddAttribute = () => {
        const attributes = [
            ...this.props.attributes,
            {
                equipmentId: 0,
                key: "",
                value: ""
            }
        ];
        this.props.updateAttributes(attributes);
    };

    private _onEditAttribute = (i: number, prop: string, val: string) => {
        const attributes = [...this.props.attributes];
        attributes[i] = {
            ...attributes[i],
            [prop]: val
        };
        this.props.updateAttributes(attributes);
    };

    private _onRemoveAttribute = (i: number) => {
        const attributes = [...this.props.attributes];
        attributes.splice(i, 1);

        this.props.updateAttributes(attributes);
    };
}
