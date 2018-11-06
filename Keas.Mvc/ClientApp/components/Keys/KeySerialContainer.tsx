import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IKeySerial, IPerson } from "../../Types";

import AssignKeySerial from "./AssignKeySerial";
import Denied from "../Shared/Denied";
import KeySerialList from "./KeySerialList";
import KeySerialDetails from "./KeySerialDetails";

import {PermissionsUtil} from "../../util/permissions";

interface IState {
  keySerials: IKeySerial[];
  loading: boolean;
}

interface IProps {
  selectedPerson?: IPerson;
  selectedKey?: IKey;
  assetInUseUpdated?: (type: string, keySerialId: number, personId: number, count: number) => void;
  assetTotalUpdated?: (type: string, keySerialId: number, personId: number, count: number) => void;
  assetEdited?:       (type: string, keySerialId: number, personId: number) => void; 
}

export default class KeySerialContainer extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    permissions: PropTypes.array,
    router: PropTypes.object,
    team: PropTypes.object
  };

  public context: AppContext;

  constructor(props: IProps) {
    super(props);

    this.state = {
      keySerials: [],
      loading: true,
    };
  }
  public async componentDidMount() {
    
    const { selectedPerson, selectedKey } = this.props;

    // are we getting the person's key or the team's?
    let keyFetchUrl =  "";
    if(!!selectedPerson)
    {
      keyFetchUrl = `/api/${this.context.team.slug}/keySerials/listassigned?personid=${selectedPerson.id}`;
    }
    else if(!!selectedKey)
    {
      keyFetchUrl = `/api/${this.context.team.slug}/keySerials/getforkey?keyid=${selectedKey.id}`;
    }
    else
    {
      keyFetchUrl = `/api/${this.context.team.slug}/keySerials/list/`;
    }

    const keySerials = await this.context.fetch(keyFetchUrl);

    this.setState({ keySerials, loading: false });
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
    const detailKeySerial = this.state.keySerials.find(k => k.id === selectedId);
    return (
      <div className="card keys-color">
        <div className="card-header-keys">
          <div className="card-head"><h2><i className="fas fa-key fa-xs"/> Key Serials</h2></div>
        </div>
        <div className="card-content">
          <KeySerialList
            keySerials={this.state.keySerials}
            onRevoke={this._revokeKeySerial}
            onAdd={this._openAssignModal}
            onEdit={this._openEditModal}
            showDetails={this._openDetailsModal}
          />
          <AssignKeySerial
            onCreate={this._createAndMaybeAssignKey}
            modal={activeAsset && (action === "create" || action === "assign")}
            onAddNew={this._openCreateModal}
            closeModal={this._closeModals}
            selectedKeySerial={detailKeySerial}
            person={this.props.selectedPerson}
          />
          <KeySerialDetails
            selectedKeySerial={detailKeySerial}
            modal={activeAsset && action === "details" && !!detailKeySerial}
            closeModal={this._closeModals}
          />
          {/* <EditKeySerial
            onEdit={this._editKey}
            closeModal={this._closeModals}
            modal={activeAsset && (action === "edit")}
            selectedKey={detailKey}
          /> */}
        </div>
      </div>
    );
  }

  private _createAndMaybeAssignKey = async (
    person: IPerson,
    keySerial: IKeySerial,
    date: any
  ) => {
    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;
    // call API to create a key, then assign it if there is a person to assign to
    // if we are creating a new key
    if (keySerial.id === 0) {
      keySerial.key.teamId = this.context.team.id;
      keySerial = await this.context.fetch(`/api/${this.context.team.slug}/keys/create`, {
        body: JSON.stringify(keySerial),
        method: "POST"
      });
      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${this.context.team.slug}/keys/assign?keyId=${keySerial.id}&personId=${
        person.id
      }&date=${date}`;

      if(!keySerial.assignment)
      {
        // don't count as assigning unless this is a new one
        updateInUseAssetCount = true;
      }
      keySerial = await this.context.fetch(assignUrl, {
        method: "POST"
      });
      keySerial.assignment.person = person;
    }

    const index = this.state.keySerials.findIndex(x => x.id === keySerial.id);
    if (index !== -1) {
      // update already existing entry in key
      const updateKeySerials = [...this.state.keySerials];
      updateKeySerials[index] = keySerial;

      this.setState({
        ...this.state,
        keySerials: updateKeySerials
      });
    } else {
      this.setState({
        keySerials: [...this.state.keySerials, keySerial]
      });
    }

    // if(updateTotalAssetCount && this.props.assetTotalUpdated)
    // {
    //     this.props.assetTotalUpdated("key", this.props.space ? this.props.space.id : null,
    //        this.props.person ? this.props.person.id : null, 1);
    // }

    // if(updateInUseAssetCount && this.props.assetInUseUpdated)
    // {
    //     this.props.assetInUseUpdated("key", this.props.space ? this.props.space.id : null,
    //       this.props.person ? this.props.person.id : null, 1);
    // }
  }

  private _revokeKeySerial = async (keySerial: IKeySerial) => {
    // call API to actually revoke
    const removed: IKeySerial = await this.context.fetch(`/api/${this.context.team.slug}/keys/revoke`, {
      body: JSON.stringify(keySerial),
      method: "POST"
    });

    // remove from state
    const index = this.state.keySerials.indexOf(keySerial);
    if (index > -1) {
      const shallowCopy = [...this.state.keySerials];
      if (this.props.selectedPerson == null) {
        // if we are looking at all key, just update assignment
        shallowCopy[index] = removed;
      } else {
        // if we are looking at a person, remove from our list of key
        shallowCopy.splice(index, 1);
      }

      this.setState({ keySerials: shallowCopy });

      // if(this.props.assetInUseUpdated)
      // {
      //   this.props.assetInUseUpdated("key", this.props.space ? this.props.space.id: null,
      //   this.props.person ? this.props.person.id : null, -1); 
      // }
    }
  };

  private _editKeySerial = async (keySerial: IKeySerial) =>
  {
    const index = this.state.keySerials.findIndex(x => x.id === keySerial.id);

    if(index === -1 ) // should always already exist
    {
      return;
    }

    const updated: IKeySerial = await this.context.fetch(`/api/${this.context.team.slug}/keys/update`, {
      body: JSON.stringify(keySerial),
      method: "POST"
    });

    // update already existing entry in key
    const updateKeySerials = [...this.state.keySerials];
    updateKeySerials[index] = updated;

    this.setState({
      ...this.state,
      keySerials: updateKeySerials
    });

    // if(this.props.assetEdited)
    // {
    //   this.props.assetEdited("key", this.props.space ? this.props.space.id : null,
    //     this.props.person ? this.props.person.id : null);
    // }
    
    // TODO: handle count changes once keys are related to spaces
  }

  private _openAssignModal = (keySerial: IKeySerial) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keyserials/assign/${keySerial.id}`
    );
  };

  private _openCreateModal = () => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keyserials/create`
    );
  };

  private _openDetailsModal = (keySerial: IKeySerial) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keyserials/details/${keySerial.id}`
    );
  };

  private _openEditModal = (keySerial: IKeySerial) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/keyserials/edit/${keySerial.id}`
    );
  };

  private _closeModals = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/keys`);
  };

  private _getBaseUrl = () => {
    const { selectedPerson, selectedKey } = this.props;
    const slug = this.context.team.slug;

    if(!!selectedPerson)
    {
      return `/${slug}/people/details/${selectedPerson.id}`;
    }

    if(!!selectedKey)
    {
      return `/${slug}/keys/details/${selectedKey.id}`;
    }

    return `/${slug}`;
  }
}
