import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson, ISpace } from "../../Types";

import AssociateSpace from "./AssociateSpace";
import CreateKey from "./CreateKey";
import Denied from "../Shared/Denied";
import EditKey from "./EditKey";
import KeyDetailContainer from "./KeyDetailContainer";
import KeyList from "./KeyList";

import {PermissionsUtil} from "../../util/permissions";

interface IState {
  loading: boolean;
  keys: IKey[]; // either key assigned to this person, or all team keys
}

interface IProps {
  assetInUseUpdated?: (type: string, spaceId: number, personId: number, count: number) => void;
  assetTotalUpdated?: (type: string, spaceId: number, personId: number, count: number) => void;
  assetEdited?: (type: string, spaceId: number, personId: number) => void; 
  person?: IPerson;
  space?: ISpace;
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
      keyFetchUrl = `/api/${this.context.team.slug}/keys/listassigned?personid=${this.props.person.id}`;
    } else if(!!this.props.space) {
      keyFetchUrl = `/api/${this.context.team.slug}/keys/getKeysInSpace?spaceId=${this.props.space.id}`;
    } else {
      keyFetchUrl = `/api/${this.context.team.slug}/keys/list/`;
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

    const { keyAction } = this.context.router.route.match.params;
    
    return (
      <div className="card keys-color">
        <div className="card-header-keys">
          <div className="card-head">
            <h2><i className="fas fa-key fa-xs"/> Keys</h2>
          </div>
        </div>
        <div className="card-content">
            { keyAction !== "details" &&
                this._renderTableView()
            }
            { keyAction === "details" &&
                this._renderDetailsView()
            }
        </div>
      </div>
    );
  }
  
  private _renderTableView() {
    const { space } = this.props;
    const { keyAction, keyId, action } = this.context.router.route.match.params;

    const selectedKeyId = parseInt(keyId, 10);
    const selectedKey = this.state.keys.find(k => k.id === selectedKeyId);

    return (
      <div>
        <KeyList
          keys={this.state.keys}
          onEdit={this._openEditModal}
          showDetails={this._openDetailsModal}
          onDisassociate={!!space ? (k) => this._disassociateSpace(space, k) : null}
        />
        <CreateKey
          onCreate={this._createKey}
          onOpenModal={this._openCreateModal}
          closeModal={this._closeModals}
          modal={keyAction === "create"}
        />
        <EditKey
          onEdit={this._editKey}
          closeModal={this._closeModals}
          modal={keyAction === "edit"}
          selectedKey={selectedKey}
        />
        {!!space &&
          <AssociateSpace
            selectedKey={selectedKey}
            selectedSpace={space}
            onAssign={this._associateSpace}
            isModalOpen={action === "associate"}
            openModal={this._openAssociate}
            closeModal={this._closeModals}
          />
        }
      </div>
    );
  }

  private _renderDetailsView() {
    const { keyId } = this.context.router.route.match.params;
    const selectedKeyId = parseInt(keyId, 10);
    const selectedKey = this.state.keys.find(k => k.id === selectedKeyId);

    return (
      <KeyDetailContainer
        selectedKey={selectedKey}
        goBack={this._closeModals}
      />
    );
  }

  private _createKey = async (key: IKey) => {
    // call API to create a key
    key.teamId = this.context.team.id;
    key = await this.context.fetch(`/api/${this.context.team.slug}/keys/create`, {
      body: JSON.stringify(key),
      method: "POST"
    });

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

    if(this.props.assetTotalUpdated)
    {
        this.props.assetTotalUpdated("key", this.props.space ? this.props.space.id : null,
           this.props.person ? this.props.person.id : null, 1);
    }
  };

  private _editKey = async (key: IKey) =>
  {
    const index = this.state.keys.findIndex(x => x.id === key.id);

    if(index === -1 ) // should always already exist
    {
      return;
    }

    const updated: IKey = await this.context.fetch(`/api/${this.context.team.slug}/keys/update`, {
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

    if(this.props.assetEdited)
    {
      this.props.assetEdited("key", this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null);
    }
    
    // TODO: handle count changes once keys are related to spaces
  }

  private _associateSpace = async (space: ISpace, key: IKey) => {
    const { team } = this.context;
    const { keys } = this.state;

    const url = `/api/${team.slug}/keys/associateSpace?spaceId=${space.id}&keyId=${key.id}`;
    const result = await this.context.fetch(url, {
        method: "POST",
    });

    const updatedKeys = [...keys, key];
    this.setState({
        keys: updatedKeys,
    });
}

private _disassociateSpace = async (space: ISpace, key: IKey) => {
    const { team } = this.context;
    const { keys } = this.state;

    const url = `/api/${team.slug}/keys/disassociateSpace?spaceId=${space.id}&keyId=${key.id}`;
    const result = await this.context.fetch(url, {
        method: "POST",
    });
    
    const updatedKeys = [...keys];
    const index = updatedKeys.findIndex(k => k.id === key.id);
    updatedKeys.splice(index, 1);

    this.setState({
      keys: updatedKeys,
    });
}

  private _openCreateModal = () => {
    const { team } = this.context;
    this.context.router.history.push(`/${team.slug}/keys/create`);
  };

  private _openDetailsModal = (key: IKey) => {
    const { team } = this.context;
    this.context.router.history.push(`/${team.slug}/keys/details/${key.id}`);
  };

  private _openEditModal = (key: IKey) => {
    const { team } = this.context;
    this.context.router.history.push(`/${team.slug}/keys/edit/${key.id}`);
  };

  private _openAssociate = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/keys/associate`);
  }

  private _closeModals = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/keys`);
  };

  private _getBaseUrl = () => {
    const { person, space } = this.props;
    const slug = this.context.team.slug;

    if(!!person) {
      return `/${slug}/people/details/${person.id}`;
    }

    if(!!space) {
      return `/${slug}/spaces/details/${space.id}`;
    }

    return `/${slug}`;
  }
}
