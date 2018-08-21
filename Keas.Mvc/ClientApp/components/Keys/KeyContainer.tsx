import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson } from "../../Types";

import AssignKey from "./AssignKey";
import EditKey from "./EditKey";
import KeyDetails from "./KeyDetails";
import KeyList from "./KeyList";
import Denied from "../Shared/Denied";
import {PermissionsUtil} from "../../util/permissions";

interface IState {
  loading: boolean;
  keys: IKey[]; // either key assigned to this person, or all team keys
}

interface IProps {
  keyAssigned?: (type: string, spaceId: number, personId: number, created: boolean, assigned: boolean) => void;
  keyRevoked?: (type: string, spaceId: number, personId: number) => void;
  keyEdited?: (type: string, spaceId: number, personId: number) => void;
  person?: IPerson;
  spaceId?: number;
}

export default class KeyContainer extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    permissions: PropTypes.array,
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
    let keyFetchUrl =  "";
    if(!!this.props.person)
    {
      keyFetchUrl = `/api/${this.context.team.name}/keys/listassigned?personid=${this.props.person.id}`;
    } else if(!!this.props.spaceId) {
      keyFetchUrl = `/api/${this.context.team.name}/keys/getKeysInSpace?spaceId=${this.props.spaceId}`;
    } else {
      keyFetchUrl = `/api/${this.context.team.name}/keys/list/`;
    }

    const keys = await this.context.fetch(keyFetchUrl);
    this.setState({ keys, loading: false });
  }
  public render() {
    if (!PermissionsUtil.canViewKeys(this.context.permissions)) {
        return (
            <Denied viewName="Keys" />
        );
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    const { action, assetType, id } = this.context.router.route.match.params;
    const activeAsset = !assetType || assetType === "keys";
    const selectedId = parseInt(id, 10);
    const detailKey = this.state.keys.find(k => k.id === selectedId);
    return (
      <div className="card keys-color">
        <div className="card-header-keys">
          <div className="card-head"><h2><i className="fas fa-key fa-xs"/> Keys</h2></div>
        </div>
        <div className="card-content">
          <KeyList
            keys={this.state.keys}
            onRevoke={this._revokeKey}
            onAdd={this._openAssignModal}
            onEdit={this._openEditModal}
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
          <EditKey
            onEdit={this._editKey}
            closeModal={this._closeModals}
            modal={activeAsset && (action === "edit")}
            selectedKey={detailKey}
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
    let created = false;
    let assigned = false;
    // call API to create a key, then assign it if there is a person to assign to
    // if we are creating a new key
    if (key.id === 0) {
      key.teamId = this.context.team.id;
      key = await this.context.fetch(`/api/${this.context.team.name}/keys/create`, {
        body: JSON.stringify(key),
        method: "POST"
      });
      created = true;
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
      assigned = true;
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
    if(this.props.keyAssigned)
    {
        this.props.keyAssigned("key", this.props.spaceId, this.props.person ? this.props.person.id : null, created, assigned);
    }
  };

  private _revokeKey = async (key: IKey) => {
    // call API to actually revoke
    const removed: IKey = await this.context.fetch(`/api/${this.context.team.name}/keys/revoke`, {
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

      if(this.props.keyRevoked)
      {
        this.props.keyRevoked("key", this.props.spaceId, this.props.person ? this.props.person.id : null);
      }
    }
  };

  private _editKey = async (key: IKey) =>
  {
    const index = this.state.keys.findIndex(x => x.id === key.id);

    if(index === -1 ) // should always already exist
    {
      return;
    }

    const updated: IKey = await this.context.fetch(`/api/${this.context.team.name}/keys/update`, {
      body: JSON.stringify(key),
      method: "POST"
    });

    // update already existing entry in key
    const updateKey = [...this.state.keys];
    updateKey[index] = updated;

    this.setState({
      ...this.state,
      keys: updateKey
    });

    if(this.props.keyEdited)
    {
      this.props.keyEdited("key", this.props.spaceId, this.props.person ? this.props.person.id : null);
    }
  }

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

  private _openEditModal = (key: IKey) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keys/edit/${key.id}`
    );
  };

  private _closeModals = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/keys`);
  };

  private _getBaseUrl = () => {
    if(!!this.props.person)
    {
      return `/${this.context.team.name}/people/details/${this.props.person.id}`;
    } else if(!!this.props.spaceId)
    {
      return `/${this.context.team.name}/spaces/details/${this.props.spaceId}`;
    } else {
      return `/${this.context.team.name}`;
    }
}
