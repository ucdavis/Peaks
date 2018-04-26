import PropTypes from "prop-types";
import * as React from "react";
import {
  Button,
  Collapse
} from "reactstrap";

import { AppContext, IEquipment, IEquipmentAttribute } from "../../Types";


interface IProps {
  equipment: IEquipment;
  addAttribute: (key: string, value: string) => void;
}

interface IState {
    adddingAttribute: boolean;
    key: string;
    value: string;
}

export default class CreateAttribute extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
        adddingAttribute: false,
        key: "",
        value: "",
    };
  }

  public render() {
    return (
      <div>
        <label>Add Atrribute</label>
        <Button color="danger" onClick={this._openInput}>
          +
        </Button>
        <Collapse isOpen={this.state.adddingAttribute}>
                <div className="form-group">
                    <label>Attribute Key</label>
                    <input type="text"
                        className="form-control"
                        value={this.state.key}
                        onChange={(e) => this._changeProperty("key", e.target.value)}
                    />
                </div>
        </Collapse>
      </div>
    );
  }

  private _openInput = () => {
      this.setState({adddingAttribute: true});
  }

  private _changeProperty = (key: string, value: string) => {
    this.setState({
        ...this.state,
        [key]: value
    });
  };

}
