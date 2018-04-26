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
  addAttributes: (attribute: IEquipmentAttribute[]) => void;
}

interface IState {
    attributes: IEquipmentAttribute[];
}

export default class EquipmentAttributes extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
        attributes: !this.props.equipment.attributes ? [] : this.props.equipment.attributes,
    };
  }

  public render() {
    const attributeList = this.state.attributes.map((attr, i) => (
      <EquipmentAttribute key={`attr-${i}`} 
        attribute={attr} 
        index={i}
        onEdit={this._onEditAttribute}/>
    ));
    return (
      <div>
        <label>Atrributes</label>
        <table className="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          {attributeList}
          <tfoot>
            <tr>
              <td colSpan={2}>
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
      ...this.state.attributes,
      {
        // equipment: this.props.equipment,
        equipmentId: this.props.equipment.id,
        key: "",
        value: "",
      }
    ];

    this.setState({attributes});
  }

  private _onEditAttribute = (i: number, key: string, value: string) => {
    const attributes = this.state.attributes;
    attributes[i].key = key;
    attributes[i].value = value;

    this.setState({attributes});
  }
}
