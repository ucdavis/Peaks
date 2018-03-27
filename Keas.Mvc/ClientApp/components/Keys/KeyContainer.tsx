import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson } from "../../Types";

import AssignKey from "./AssignKey";
import KeyDetails from "./KeyDetails";
import KeyList from "./KeyList";

interface IState {
  loading: boolean;
  // either key assigned to this person, or all team keys
  keys: IKey[];
  selectedKey: IKey;
}

export default class KeyContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    router: PropTypes.object,
    team: PropTypes.object,
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      keys: [],
      loading: true,
      selectedKey: null
    };
  }
  public async componentDidMount() {
    // are we getting the person's key or the team's?
    const keyFetchUrl = this.context.person
      ? `/keys/listassigned?personid=${this.context.person.id}&teamId=${
          this.context.person.teamId
        }`
      : `/keys/list/${this.context.team.id}`;

    const keys = await this.context.fetch(keyFetchUrl);
    this.setState({ keys, loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    const assignedKeyList = this.context.person
      ? this.state.keys.map(x => x.name)
      : null;
    const allKeyList = this.context.person ? null : this.state.keys;

    const { action, id } = this.context.router.route.match.params;
    const selectedId = parseInt(id, 10);
    const detailKey = this.state.keys.find(k => k.id === selectedId);
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Key</h4>
          <KeyList
            keys={this.state.keys}
            onRevoke={this._revokeKey}
            onAdd={this._assignSelectedKey}
            showDetails={this._openDetailsModal}
          />
          <AssignKey
            onCreate={this._createAndMaybeAssignKey}
            modal={action === "create"}
            openModal={this._openAssignModal}
            closeModal={this._closeModals}
            selectedKey={this.state.selectedKey}
            selectKey={this._selectKey}
            changeProperty={this._changeSelectedKeyProperty}
          />
          <KeyDetails
            selectedKey={detailKey}
            modal={action === "details" && !!detailKey}
            closeModal={this._closeModals}
          />
        </div>
      </div>
    );
  }
  private _createAndMaybeAssignKey = async (person: IPerson, date: any) => {
    // call API to create a key, then assign it if there is a person to assign to
    var key = this.state.selectedKey;
    //if we are creating a new key
    if (key.id === 0) {
      key.teamId = this.context.team.id;
      key = await this.context.fetch("/keys/create", {
        body: JSON.stringify(key),
        method: "POST"
      });
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/keys/assign?keyId=${key.id}&personId=${
        person.id
      }&date=${date}`;

      key = await this.context.fetch(assignUrl, {
        method: "POST"
      });
    }

    let index = this.state.keys.findIndex(x => x.id == key.id);
    console.log("index " + index);
    if (index !== -1) {
      console.log("changing");
      //update already existing entry in key
      let updateKey = [...this.state.keys];
      updateKey[index] = key;

      this.setState({
        ...this.state,
        keys: updateKey
      });
    } else {
      this.setState({
        keys: [...this.state.keys, key]
      });
    }
  };

  private _revokeKey = async (key: IKey) => {
    // call API to actually revoke
    const removed: IKey = await this.context.fetch("/keys/revoke", {
      body: JSON.stringify(key),
      method: "POST"
    });

    //remove from state
    const index = this.state.keys.indexOf(key);
    if (index > -1) {
      let shallowCopy = [...this.state.keys];
      if (this.context.person == null) {
        //if we are looking at all key, just update assignment
        shallowCopy[index] = removed;
      } else {
        //if we are looking at a person, remove from our list of key
        shallowCopy.splice(index, 1);
      }
      this.setState({ keys: shallowCopy });
    }
  };

  //pulls up assign modal from dropdown action
  private _assignSelectedKey = (key: IKey) => {
    this.setState({ selectedKey: key });
    this._openAssignModal();
  };

  private _openAssignModal = async () => {
    this.context.router.history.push(
      `/${this.context.team.name}/asset/keys/create`
    );
  };

  //used in assign key
  private _selectKey = (key: IKey) => {
    this.setState({ selectedKey: key });
  };

  private _changeSelectedKeyProperty = (property: string, value: string) => {
    this.setState({
      selectedKey: {
        ...this.state.selectedKey,
        [property]: value
      }
    });
  };

  private _openDetailsModal = (key: IKey) => {
    this.context.router.history.push(
      `/${this.context.team.name}/asset/keys/details/${key.id}`
    );
  };
  private _closeModals = () => {
    this.context.router.history.push(`/${this.context.team.name}/asset/keys`);
  };
}
