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

interface IState {
  commonKeys: string[];
  loading: boolean;
}

export default class EquipmentAttributes extends React.Component<IProps, IState> {
    public static contextTypes = {
      fetch: PropTypes.func,
      person: PropTypes.object,
      team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
      super(props);
      this.state = {
          commonKeys: [],
          loading: true,
      };
  }

  public async componentDidMount() {
    const equipmentFetchUrl = `/equipment/commonAttributeKeys/${this.context.team.id}`;

    const commonKeys = await this.context.fetch(equipmentFetchUrl);
    this.setState({ commonKeys, loading: false });
  }

  public render() {
    const attributeList = this.props.equipment.attributes.map((attr, i) => (
      <EquipmentAttribute key={`attr-${i}`} 
        commonKeys={this.state.commonKeys}
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
        equipmentId: 0,
        key: "",
        value: "",
      }
    ];
    this.props.updateAttributes(attributes);
  }

  private _onEditAttribute = (i: number, key: string, value: string) => {
    const attributes = this.props.equipment.attributes;
    attributes[i].key = key;
    attributes[i].value = value;

    this.props.updateAttributes(attributes);
  }

  private _onRemoveAttribute = (i: number) => {
    const attributes = this.props.equipment.attributes;
    attributes.splice(i,1);

    this.props.updateAttributes(attributes);
  }
  
}
