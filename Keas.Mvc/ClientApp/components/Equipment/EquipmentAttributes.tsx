import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  Collapse
} from "reactstrap";

import { AppContext, IEquipment, IEquipmentAttribute } from "../../Types";
import EquipmentAttribute from "./EquipmentAttribute";

interface IProps {
  equipment: IEquipment;
  disableAdd: boolean;
  updateAttributes: (attribute: IEquipmentAttribute[]) => void;
}

export default class EquipmentAttributes extends React.Component<IProps, {}> {

  public render() {
    const attributeList = this.props.equipment.attributes.map((attr, i) => (
      <EquipmentAttribute key={`attr-${i}`} 
        attribute={attr} 
        index={i}
        onEdit={this._onEditAttribute}
        onRemove={this._onRemoveAttribute}/>
    ));
    return (
      <div>
        <label>Atrributes</label>
        <table className="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Remove</th>
            </tr>
          </thead>
          {attributeList}
          <tfoot>
            <tr>
              <td colSpan={3}>
                <Button className="btn btn-primary" id="add-new" onClick={this._onAddAttribute}>
                  Add New
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  private _onAddAttribute = () => {
    const attributes = [
      ...this.props.equipment.attributes,
      {
        // equipment: this.props.equipment,
        equipmentId: 0,
        key: "",
        value: "",
      }
    ];
    this.props.updateAttributes(attributes);
  }

  private _onEditAttribute = (i: number, key: string, value: string) => {
    let attributes = this.props.equipment.attributes;
    attributes[i].key = key;
    attributes[i].value = value;

    this.props.updateAttributes(attributes);
  }

  private _onRemoveAttribute = (i: number) => {
    let attributes = this.props.equipment.attributes;
    attributes.splice(i,1);

    this.props.updateAttributes(attributes);
  }
}
