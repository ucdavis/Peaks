import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson } from "../../Types";

import AssignKey from "./AssignKey";
import KeyDetails from "./KeyDetails";
import KeyList from "./KeyList";

interface IState {
  loading: boolean;
  keys: IKey[]; // either key assigned to this person, or all team keys
}

interface IProps {
  person?: IPerson;
}

export default class KeyContainer extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      keys: [],
      loading: true
    };
  }
  public async componentDidMount() {
    // are we getting the person's key or the team's?
    const keyFetchUrl = this.props.person
      ? `/api/${this.context.team.name}/keys/listassigned?personid=${this.props.person.id}`
      : `/api/${this.context.team.name}/keys/list/`;

    const keys = await this.context.fetch(keyFetchUrl);
    this.setState({ keys, loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    const { action, assetType, id } = this.context.router.route.match.params;
    const activeAsset = !assetType || assetType === "keys";
    const selectedId = parseInt(id, 10);
    const detailKey = this.state.keys.find(k => k.id === selectedId);
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Key</h4>
          <KeyList
            keys={this.state.keys}
            onRevoke={this._revokeKey}
            onAdd={this._openAssignModal}
            showDetails={this._openDetailsModal}
          />
          <AssignKey
            onCreate={this._createAndMaybeAssignKey}
            modal={activeAsset && (action === "create" || action === "assign")}
            onAddNew={this._openCreateModal}
            closeModal={this._closeModals}
            selectedKey={detailKey}
            person={this.props.person}
          />
          <KeyDetails
            selectedKey={detailKey}
            modal={activeAsset && action === "details" && !!detailKey}
            closeModal={this._closeModals}
          />
        </div>
      </div>
    );
  }

  private _createAndMaybeAssignKey = async (
    person: IPerson,
    key: IKey,
    date: any
  ) => {
    // call API to create a key, then assign it if there is a person to assign to
    // if we are creating a new key
    if (key.id === 0) {
      key.teamId = this.context.team.id;
      key = await this.context.fetch("/api/${this.context.team.name}/keys/create", {
        body: JSON.stringify(key),
        method: "POST"
      });
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${this.context.team.name}/keys/assign?keyId=${key.id}&personId=${
        person.id
      }&date=${date}`;

      key = await this.context.fetch(assignUrl, {
        method: "POST"
      });
      key.assignment.person = person;
    }

    const index = this.state.keys.findIndex(x => x.id === key.id);
    if (index !== -1) {
      // update already existing entry in key
      const updateKey = [...this.state.keys];
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
    const removed: IKey = await this.context.fetch("/api/${this.context.team.name}/keys/revoke", {
      body: JSON.stringify(key),
      method: "POST"
    });

    // remove from state
    const index = this.state.keys.indexOf(key);
    if (index > -1) {
      const shallowCopy = [...this.state.keys];
      if (this.props.person == null) {
        // if we are looking at all key, just update assignment
        shallowCopy[index] = removed;
      } else {
        // if we are looking at a person, remove from our list of key
        shallowCopy.splice(index, 1);
      }
      this.setState({ keys: shallowCopy });
    }
  };

  private _openAssignModal = (key: IKey) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keys/assign/${key.id}`
    );
  };

  private _openCreateModal = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/keys/create`);
  };

  private _openDetailsModal = (key: IKey) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keys/details/${key.id}`
    );
  };
  private _closeModals = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/keys`);
  };

  private _getBaseUrl = () => {
    return this.props.person
      ? `/${this.context.team.name}/person/details/${this.props.person.id}`
      : `/${this.context.team.name}`;
  };
}
