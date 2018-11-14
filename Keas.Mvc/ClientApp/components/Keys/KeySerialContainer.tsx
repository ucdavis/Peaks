import * as PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IKeySerial, IPerson } from "../../Types";

import AssignKeySerial from "./AssignKeySerial";
import Denied from "../Shared/Denied";
import EditKeySerial from "./EditKeySerial";
import KeySerialList from "./KeySerialList";
import KeySerialDetails from "./KeySerialDetails";

import {PermissionsUtil} from "../../util/permissions";
import CreateKeySerial from "./CreateKeySerial";

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
    
    let dateNow = new Date();
    let dateThen = new Date(2040, 11, 24, 10, 33, 30, 0);
    // TODO: remove
    if (dateNow <= dateThen) {
        return;
    }

    const { selectedPerson, selectedKey } = this.props;

    // are we getting the person's key or the team's?
    let keyFetchUrl =  "";
    if(!!selectedPerson)
    {
      keyFetchUrl = `/api/${this.context.team.slug}/keySerials/getforperson?personid=${selectedPerson.id}`;
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
    const { selectedKey } = this.props;

    if (!PermissionsUtil.canViewKeys(this.context.permissions)) {
        return (
            <Denied viewName="Keys" />
        );
    }

    let dateNow = new Date();
    let dateThen = new Date(2040, 11, 24, 10, 33, 30, 0);
    // TODO: remove
    if(dateNow <= dateThen)
    {
      return(
        <div className="card keys-color">
        <div className="card-header-keys">
          <div className="card-head"><h2><i className="fas fa-key fa-xs"/> Key Serials</h2></div>
        </div>
        <div className="card-content">
          <h3><i className="fas fa-wrench fa-xs fa-flip-horizontal"/> Keys are currently under construction <i className="fas fa-wrench fa-xs"/></h3>
        </div>
      </div>
      );
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    const { action, assetType, id } = this.context.router.route.match.params;
    const activeAsset = !assetType || assetType === "keyserials";
    const selectedKeySerialId = parseInt(id, 10);
    const selectedKeySerial = this.state.keySerials.find(s => s.id === selectedKeySerialId);

    return (
      <div className="card keys-color">
        <div className="card-header-keys">
          <div className="card-head"><h2><i className="fas fa-key fa-xs"/> Key Serials</h2></div>
        </div>
        <div className="card-content">
          <KeySerialList
            keySerials={this.state.keySerials}
            onRevoke={this._revokeKeySerial}
            onAssign={this._openAssignModal}
            onEdit={this._openEditModal}
            showDetails={this._openDetailsModal}
          />
          <AssignKeySerial
            person={this.props.selectedPerson}
            selectedKey={selectedKey}
            selectedKeySerial={selectedKeySerial}
            onCreate={this._createAndMaybeAssignKey}
            isModalOpen={activeAsset && (action === "create" || action === "assign")}
            onOpenModal={this._openCreateModal}
            closeModal={this._closeModals}
          />
          <KeySerialDetails
            selectedKeySerial={selectedKeySerial}
            isModalOpen={activeAsset && action === "details" && !!selectedKeySerial}
            closeModal={this._closeModals}
          />
          <EditKeySerial
            selectedKeySerial={selectedKeySerial}
            onOpenModal={this._editKeySerial}
            closeModal={this._closeModals}
            isModalOpen={activeAsset && (action === "edit")}
          />
        </div>
      </div>
    );
  }

  private _createAndMaybeAssignKey = async (
    person: IPerson,
    keySerial: IKeySerial,
    date: any
  ) => {
    const { team } = this.context;

    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;

    // if we are creating a new key
    if (keySerial.id === 0) {
      keySerial.key.teamId = this.context.team.id;
      keySerial = await this.context.fetch(`/api/${this.context.team.slug}/keyserials/create`, {
        body: JSON.stringify(keySerial),
        method: "POST"
      });
      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${team.slug}/keyserials/assign?serialId=${keySerial.id}&personId=${person.id}&date=${date}`;

      if (!keySerial.keySerialAssignment) {
        // don't count as assigning unless this is a new one
        updateInUseAssetCount = true;
      }

      keySerial = await this.context.fetch(assignUrl, {
        method: "POST"
      });

      keySerial.keySerialAssignment.person = person;
    }

    const index = this.state.keySerials.findIndex(x => x.id === keySerial.id);
    const updateKeySerials = [...this.state.keySerials];
    if (index < 0) {
      updateKeySerials.push(keySerial);
    }
    else {
      // update already existing entry in key
      updateKeySerials[index] = keySerial;
    }

    this.setState({
      keySerials: updateKeySerials,
    });

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
    const { team } = this.context;

    // call API to actually revoke
    const removed: IKeySerial = await this.context.fetch(`/api/${team.slug}/keyserials/revoke`, {
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
    const { team } = this.context;

    const index = this.state.keySerials.findIndex(x => x.id === keySerial.id);
    
    // should always already exist
    if (index < 0) {
      return;
    }

    const updated: IKeySerial = await this.context.fetch(`/api/${team.slug}/keyserials/update`, {
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
    this.context.router.history.push(`${this._getBaseUrl()}`);
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
