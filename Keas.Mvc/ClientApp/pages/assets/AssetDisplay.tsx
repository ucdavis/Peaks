import classnames from "classnames";
import * as React from "react";
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";

import EquipmentContainer from "../../components/Equipment/EquipmentContainer";
import KeyContainer from "../../components/Keys/KeyContainer";

import { ITeam } from "../../Types";

interface IProps {
  team: ITeam;
  onTypeChange: (type: string) => void;
  type: string;
}

export default class AssetDisplay extends React.Component<IProps, {}> {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
  }

  public render() {
    return (
      <div>
        <Nav tabs={true}>
          <NavItem>
            <NavLink
              className={classnames({
                active: this.props.type === "keys"
              })}
              onClick={() => {
                this.toggle("keys");
              }}
            >
              Keys
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: this.props.type === "equipment"
              })}
              onClick={() => {
                this.toggle("equipment");
              }}
            >
              Equipment
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.props.type === "2" })}
              onClick={() => {
                this.toggle("2");
              }}
            >
              Access
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.props.type === "2" })}
              onClick={() => {
                this.toggle("4");
              }}
            >
              Space
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.props.type}>
          <TabPane tabId="1">
            <div className="container">Pane 1</div>
          </TabPane>
          <TabPane tabId="2">
            <div className="container">Pane 2</div>
          </TabPane>
          <TabPane tabId="keys">{this._renderKeys()}</TabPane>
          <TabPane tabId="equipment">{this._renderEquipment()}</TabPane>
        </TabContent>
      </div>
    );
  }

  private toggle(tab) {
    // go change route
    if (this.props.type !== tab) {
      this.props.onTypeChange(tab);
    }
  }
  private _renderKeys = () => {
    if (this.props.type === "keys") {
      return <KeyContainer />;
    }
  };
  private _renderEquipment = () => {
    if (this.props.type === "equipment") {
      return <EquipmentContainer />;
    }
  };
}
