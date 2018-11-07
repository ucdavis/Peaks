import * as PropTypes from 'prop-types';
import * as React from "react";
import {
  Button,
  Collapse
} from "reactstrap";

import { AppContext, IEquipment, IEquipmentAttribute } from "../../Types";
import EquipmentAttribute from "./EquipmentAttribute";

interface IProps {
  commonKeys: string[]
  disableEdit: boolean;
  equipment: IEquipment;
  updateAttributes: (attribute: IEquipmentAttribute[]) => void;
}

export default class EquipmentAttributes extends React.Component<IProps, {}> {
  public render() {
    const attributeList = this.props.equipment.attributes.map((attr, i) => (
      <EquipmentAttribute key={`attr-${i}`} 
        disabledEdit={this.props.disableEdit}
        commonKeys={this.props.commonKeys}
        attribute={attr} 
        index={i}
        changeProperty={this._onEditAttribute}
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
              {!this.props.disableEdit &&
                <th>Remove</th>}
            </tr>
          </thead>
          {attributeList}
          {!this.props.disableEdit && 
          <tfoot>
            <tr>
              <td colSpan={3}>
                <Button className="btn btn-primary" id="add-new" onClick={this._onAddAttribute}>
                  Add New
                </Button>
              </td>
            </tr>
          </tfoot>}
        </table>
      </div>
    );
  }

  private _onAddAttribute = () => {
    const attributes = [
      ...this.props.equipment.attributes,
      {
        equipmentId: 0,
        key: "",
        value: "",
      }
    ];
    this.props.updateAttributes(attributes);
  }

  private _onEditAttribute = (i: number, prop: string, val: string) => {
    const attributes = this.props.equipment.attributes;
    attributes[i] = {
      ...attributes[i],
      [prop]: val
    }
    this.props.updateAttributes(attributes);
  }

  private _onRemoveAttribute = (i: number) => {
    const attributes = this.props.equipment.attributes;
    attributes.splice(i,1);

    this.props.updateAttributes(attributes);
  }
  
}
