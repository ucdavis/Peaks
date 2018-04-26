import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  Collapse
} from "reactstrap";

import { AppContext, IEquipment, IEquipmentAttribute } from "../../Types";


interface IProps {
  equipment: IEquipment;
  addAttribute: (attribute: IEquipmentAttribute) => void;
}

interface IState {
    addingAttribute: boolean;
    attribute: IEquipmentAttribute;
    valid: boolean;
}

export default class CreateAttribute extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
        addingAttribute: false,
        attribute: {
          equipmentId: this.props.equipment.id,
          key: "",
          value: "",
        },
        valid: false,
    };
  }

  public render() {
    return (
      <div>
        <label>Add Atrribute</label>
        <Button color="secondary" onClick={this._toggle}>
          +
        </Button>
        <Collapse isOpen={this.state.addingAttribute}>
                <div className="form-group">
                    <label>Attribute Key</label>
                    <input type="text"
                        className="form-control"
                        value={this.state.attribute.key}
                        onChange={(e) => this._changeProperty("key", e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Attribute Value</label>
                    <input type="text"
                        className="form-control"
                        value={this.state.attribute.value}
                        onChange={(e) => this._changeProperty("value", e.target.value)}
                    />
                </div>
                <Button color="primary" disabled={!this.state.valid} onClick={this._addAttribute}>Add attribute</Button>
        </Collapse>
      </div>
    );
  }

  private _toggle = () => {
      this.setState({addingAttribute: true});
  }

  private _changeProperty = (property: string, val: string) => {
    this.setState({
        ...this.state,
        attribute: {
          ...this.state.attribute,
          [property]: val
        }
    }, this._validate);
  };

  private _validate = () => {
    let valid = true;
    if(!this.state.attribute.key || !this.state.attribute.value)
    {
      valid = false;
    }
    this.setState({valid});
  }

  private _addAttribute = () => {
    if(!this.state.valid)
    {
      return;
    }
    this.props.addAttribute(this.state.attribute);
  }

}
