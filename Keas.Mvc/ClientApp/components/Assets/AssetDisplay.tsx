import * as React from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import classnames from "classnames";

import { ITeam } from "../../Types";

interface IProps {
  team: ITeam;
}

interface IState {
  activeTab: string;
}

export default class AssetDisplay extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: "keys"
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render() {
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: this.state.activeTab === "keys"
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
                active: this.state.activeTab === "equipment"
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
              className={classnames({ active: this.state.activeTab === "2" })}
              onClick={() => {
                this.toggle("2");
              }}
            >
              Access
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === "2" })}
              onClick={() => {
                this.toggle("4");
              }}
            >
              Space
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <div className="container">Pane 1</div>
          </TabPane>
          <TabPane tabId="2">
            <div className="container">Pane 2</div>
          </TabPane>
          <TabPane tabId="keys">
              <div>KEYS</div>
          </TabPane>
          <TabPane tabId="equipment">
              <div>EQUIP</div>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}
