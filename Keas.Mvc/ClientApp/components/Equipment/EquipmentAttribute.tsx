import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  Collapse
} from "reactstrap";

import { AppContext, IEquipment, IEquipmentAttribute } from "../../Types";


interface IProps {
  attribute: IEquipmentAttribute;
  index: number;
  onEdit: (i: number, key: string, value: string) => void;
  onRemove: (i:number) => void;
}

interface IState {
    key: string;
    valid: boolean;
    value: string;
}

export default class EquipmentAttribute extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
        key: this.props.attribute.key,
        valid: false,
        value: this.props.attribute.value,
    };
  }

  public render() {
    return (
        <tbody>
            <tr key={`attribute-${this.props.index}`}>
                <td>
                    <input 
                        type="text" className="form-control"
                        value={this.state.key} 
                        onBlur={this._onBlur}
                        onChange={(e) => this._changeProperty("key",e.target.value)} />
                </td>
                <td>
                    <input 
                        type="text" className="form-control"
                        value={this.state.value} 
                        onBlur={this._onBlur}
                        onChange={(e) => this._changeProperty("value",e.target.value)} />
                </td>
                <td>
                    <button type="button" className="btn btn-outline-danger" onClick={() => this.props.onRemove(this.props.index)}>
                        <i className="fa fa-trash" />
                    </button>
                </td>
            </tr>
        </tbody>
    );
  }

  private _changeProperty = (property: string, val: string) => {
    this.setState({
        ...this.state,
        [property]: val
    });
  };

  private _onBlur = () => {
      if(!this.state.key.trim())
      {
          return null;
      }
      this.props.onEdit(this.props.index, this.state.key, this.state.value);
  }

}
