import * as PropTypes from 'prop-types';
import * as React from 'react';
import { RouteChildrenProps } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import {
  AppContext,
  IAccess,
  IAccessAssignment,
  IMatchParams,
  IPerson,
  ISpace
} from '../../Types';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import SearchTags from '../Tags/SearchTags';
import AccessDetails from './AccessDetails';
import AccessList from './AccessList';
import AccessTable from './AccessTable';
import AssignAccess from './AssignAccess';
import DeleteAccess from './DeleteAccess';
import EditAccess from './EditAccess';

interface IState {
  accesses: IAccess[]; // either access assigned to this person, or all team access
  loading: boolean;
  tagFilters: string[];
  tags: string[];
}

interface IProps extends RouteChildrenProps<IMatchParams> {
  assetInUseUpdated?: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  assetTotalUpdated?: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  assetEdited?: (type: string, spaceId: number, personId: number) => void;
  person?: IPerson;
  space?: ISpace;
}

export default class AccessContainer extends React.Component<IProps, IState> {
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
      accesses: [],
      loading: true,
      tagFilters: [],
      tags: []
    };
  }
  public async componentDidMount() {
    if (!PermissionsUtil.canViewAccess(this.context.permissions)) {
      return;
    }
    // are we getting the person's access or the team's?
    const accessFetchUrl = this.props.person
      ? `/api/${this.context.team.slug}/access/listAssigned?personId=${this.props.person.id}`
      : `/api/${this.context.team.slug}/access/list/`;
    let accesses: IAccess[] = null;
    try {
      accesses = await this.context.fetch(accessFetchUrl);
    } catch (err) {
      toast.error('Error loading access list. Please refresh and try again.');
    }
    // TODO: move tags into context
    const tags = await this.context.fetch(
      `/api/${this.context.team.slug}/tags/listTags`
    );

    this.setState({ accesses, loading: false, tags });
  }
  public render() {
    if (!PermissionsUtil.canViewAccess(this.context.permissions)) {
      return <Denied viewName='Access' />;
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    const { action, assetType, id } = this.props.match.params;
    const activeAsset = !assetType || assetType === 'access';
    const selectedId = parseInt(id, 10);
    const detailAccess = this.state.accesses.find(a => a.id === selectedId);

    return (
      <div className='card access-color'>
        <div className='card-header-access'>
          <div className='card-head row justify-content-between'>
            <h2>
              <i className='fas fa-address-card fa-xs' /> Access
            </h2>
            <Button color='link' onClick={this._openCreateModal}>
              <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Access
            </Button>
          </div>
        </div>
        <div className='card-content'>
          {this._renderTableOrList()}
          {activeAsset &&
            (action === 'assign' || action === 'create') &&
            this._renderAssignModal(selectedId, detailAccess)}
          {activeAsset &&
            action === 'details' &&
            this._renderDetailsModal(selectedId, detailAccess)}
          {activeAsset &&
            action === 'edit' &&
            this._renderEditModal(selectedId, detailAccess)}
          {activeAsset &&
            action === 'delete' &&
            this._renderDeleteModal(selectedId, detailAccess)}
        </div>
      </div>
    );
  }

  private _renderTableOrList = () => {
    if (!!this.props.person || !!this.props.space) {
      return (
        <div>
          <AccessList
            access={this.state.accesses}
            personView={this.props.person ? true : false}
            onRevoke={this._openRevokeModal}
            onDelete={this._openDeleteModal}
            onAdd={this._openAssignModal}
            onEdit={this._openEditModal}
            showDetails={this._openDetailsModal}
          />
        </div>
      );
    } else {
      let filteredAccess = this.state.accesses;
      if (this.state.tagFilters.length > 0) {
        filteredAccess = filteredAccess.filter(x =>
          this._checkTagFilters(x, this.state.tagFilters)
        );
      }
      return (
        <div>
          <div className='row'>
            <SearchTags
              tags={this.state.tags}
              selected={this.state.tagFilters}
              onSelect={this._filterTags}
              disabled={false}
            />
          </div>
          <AccessTable
            accesses={filteredAccess}
            onRevoke={this._openRevokeModal}
            onDelete={this._openDeleteModal}
            onAdd={this._openAssignModal}
            onEdit={this._openEditModal}
            showDetails={this._openDetailsModal}
          />
        </div>
      );
    }
  };

  private _renderAssignModal = (selectedId: number, access?: IAccess) => {
    return (
      <AssignAccess
        key={`assign-access-${selectedId}`}
        onAddNew={this._openCreateModal}
        onCreate={this._createAndMaybeAssignAccess}
        modal={true}
        closeModal={this._closeModals}
        selectedAccess={access}
        person={this.props.person}
        tags={this.state.tags}
        openEditModal={this._openEditModal}
      />
    );
  };

  private _renderDetailsModal = (selectedId: number, access: IAccess) => {
    return (
      <AccessDetails
        key={`details-access-${selectedId}`}
        selectedAccess={access}
        modal={!!access}
        closeModal={this._closeModals}
        openEditModal={this._openEditModal}
        onRevoke={this._revokeAccess}
        updateSelectedAccess={this._updateAccessFromDetails}
      />
    );
  };

  private _renderEditModal = (selectedId: number, access: IAccess) => {
    return (
      <EditAccess
        key={`edit-access-${selectedId}`}
        onEdit={this._editAccess}
        closeModal={this._closeModals}
        modal={!!access}
        selectedAccess={access}
        onRevoke={this._revokeAccess}
        tags={this.state.tags}
      />
    );
  };

  // private _renderRevokeModal = (selectedId: number, access: IAccess) => {
  //   return (
  //     <RevokeEquipment
  //       key={`revoke-equipment-${selectedId}`}
  //       selectedEquipment={equipment}
  //       revokeEquipment={this._revokeEquipment}
  //       closeModal={this._closeModals}
  //       openEditModal={this._openEditModal}
  //       openUpdateModal={this._openAssignModal}
  //       modal={!!equipment}
  //     />
  //   );
  // };

  private _renderDeleteModal = (selectedId: number, access: IAccess) => {
    return (
      <DeleteAccess
        key={`delete-access-${selectedId}`}
        selectedAccess={access}
        onRevoke={this._revokeAccess}
        closeModal={this._closeModals}
        deleteAccess={this._deleteAccess}
        modal={!!access}
      />
    );
  };

  private _filterTags = (filters: string[]) => {
    this.setState({ tagFilters: filters });
  };

  private _checkTagFilters = (access: IAccess, filters: string[]) => {
    return filters.every(f => !!access.tags && access.tags.includes(f));
  };

  private _createAndMaybeAssignAccess = async (
    access: IAccess,
    date: any,
    person: IPerson
  ) => {
    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;
    // call API to create a access, then assign it if there is a person to assign to
    // if we are creating a new access
    if (access.id === 0) {
      access.teamId = this.context.team.id;
      try {
        access = await this.context.fetch(
          `/api/${this.context.team.slug}/access/create`,
          {
            body: JSON.stringify(access),
            method: 'POST'
          }
        );
        toast.success('Access created successfully!');
      } catch (err) {
        toast.error('Error creating access.');
        throw new Error(); // throw error so modal doesn't close
      }
      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${this.context.team.slug}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;
      let accessAssignment: IAccessAssignment = null;
      try {
        accessAssignment = await this.context.fetch(assignUrl, {
          method: 'POST'
        });
        toast.success('Access assigned successfully!');
      } catch (err) {
        toast.error('Error assigning access.');
        throw new Error(); // throw error so modal doesn't close
      }
      // fetching only returns the assignment, so add it to the access in our state with the right person
      accessAssignment.person = person;
      if (!!this.props.person) {
        // if we are on a person page, replace any fetched assignments with this one
        access.assignments = [];
      }
      // then push it
      access.assignments.push(accessAssignment);
      updateInUseAssetCount = true;
    }

    const index = this.state.accesses.findIndex(x => x.id === access.id);
    if (index !== -1) {
      // update already existing entry in access
      const updateAccesses = [...this.state.accesses];
      updateAccesses[index] = access;

      this.setState({
        ...this.state,
        accesses: updateAccesses
      });
    } else {
      this.setState({
        accesses: [...this.state.accesses, access]
      });
    }
    if (updateTotalAssetCount && this.props.assetTotalUpdated) {
      this.props.assetTotalUpdated(
        'access',
        this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null,
        1
      );
    }
    if (updateInUseAssetCount && this.props.assetInUseUpdated) {
      this.props.assetInUseUpdated(
        'access',
        this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null,
        1
      );
    }
  };

  private _revokeAccess = async (accessAssignment: IAccessAssignment) => {
    if (!confirm('Are you sure you want to revoke access?')) {
      return false;
    }
    try {
      // call API to actually revoke
      const removed: IAccess = await this.context.fetch(
        `/api/${this.context.team.slug}/access/revoke/${accessAssignment.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Access revoked sucessfully!');
    } catch (err) {
      toast.error('Error revoking access.');
      throw new Error(); // throw error so modal doesn't close
    }

    // find index of access in state
    const accessIndex = this.state.accesses.findIndex(
      x => x.id === accessAssignment.accessId
    );
    if (accessIndex > -1) {
      const shallowCopy = [...this.state.accesses];
      if (!this.props.person) {
        // if we are looking at all access, remove from access.assignments
        const assignmentIndex = shallowCopy[accessIndex].assignments.indexOf(
          accessAssignment
        );
        shallowCopy[accessIndex].assignments.splice(assignmentIndex, 1);
      } else {
        // if we are looking at a person, remove access entirely
        shallowCopy.splice(accessIndex, 1);
      }
      this.setState({ accesses: shallowCopy });

      if (this.props.assetInUseUpdated) {
        this.props.assetInUseUpdated(
          'access',
          this.props.space ? this.props.space.id : null,
          this.props.person ? this.props.person.id : null,
          -1
        );
      }
    }
  };

  private _deleteAccess = async (access: IAccess) => {
    if (!confirm('Are you sure you want to delete item?')) {
      return false;
    }
    try {
      const deleted: IAccess = await this.context.fetch(
        `/api/${this.context.team.slug}/access/delete/${access.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Access deleted successfully!');
    } catch (err) {
      toast.error('Error deleting access.');
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = this.state.accesses.indexOf(access);
    if (index > -1) {
      const shallowCopy = [...this.state.accesses];
      shallowCopy.splice(index, 1);
      this.setState({ accesses: shallowCopy });

      if (this.props.assetInUseUpdated && access.assignments.length > 0) {
        this.props.assetInUseUpdated(
          'access',
          this.props.space ? this.props.space.id : null,
          this.props.person ? this.props.person.id : null,
          -1 * access.assignments.length
        );
      }

      if (this.props.assetTotalUpdated) {
        this.props.assetTotalUpdated(
          'access',
          this.props.space ? this.props.space.id : null,
          this.props.person ? this.props.person.id : null,
          -1
        );
      }
    }
  };

  private _editAccess = async (access: IAccess) => {
    const index = this.state.accesses.findIndex(x => x.id === access.id);

    if (index === -1) {
      // should always already exist
      return;
    }

    let updated: IAccess = null;
    try {
      updated = await this.context.fetch(
        `/api/${this.context.team.slug}/access/update`,
        {
          body: JSON.stringify(access),
          method: 'POST'
        }
      );
      toast.success('Access edited successfully!');
    } catch (err) {
      toast.error('Error editing access.');
      throw new Error(); // throw error so modal doesn't close
    }

    // update already existing entry in key
    const updateAccesses = [...this.state.accesses];
    updateAccesses[index] = updated;

    this.setState({
      ...this.state,
      accesses: updateAccesses
    });

    if (this.props.assetEdited) {
      this.props.assetEdited(
        'access',
        this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null
      );
    }
  };

  private _updateAccessFromDetails = (access: IAccess, id?: number) => {
    const accessId = access ? access.id : id;
    const index = this.state.accesses.findIndex(x => x.id === accessId);

    if (index === -1) {
      // should always already exist
      return;
    }

    // update already existing entry in key
    const updateAccesses = [...this.state.accesses];
    // if access has been deleted elsewhere
    if (access === null) {
      updateAccesses.splice(index, 1);
    } else {
      updateAccesses[index] = access;
    }
    this.setState({ ...this.state, accesses: updateAccesses });
  };

  private _openAssignModal = (access: IAccess) => {
    this.props.history.push(`${this._getBaseUrl()}/access/assign/${access.id}`);
  };

  private _openRevokeModal = (access: IAccess) => {
    if (!!this.props.person) {
      // if we already have the person, just revoke
      const accessIndex = this.state.accesses.indexOf(access);
      const accessAssignment = this.state.accesses[
        accessIndex
      ].assignments.filter(x => x.personId === this.props.person.id);
      this._revokeAccess(accessAssignment[0]);
    } // otherwise, pull up the modal
    else {
      this.props.history.push(
        `${this._getBaseUrl()}/access/revoke/${access.id}`
      );
    }
  };

  private _openCreateModal = () => {
    this.props.history.push(`${this._getBaseUrl()}/access/create`);
  };

  private _openDetailsModal = (access: IAccess) => {
    this.props.history.push(
      `${this._getBaseUrl()}/access/details/${access.id}`
    );
  };

  private _openEditModal = (access: IAccess) => {
    this.props.history.push(`${this._getBaseUrl()}/access/edit/${access.id}`);
  };

  private _openDeleteModal = (access: IAccess) => {
    this.props.history.push(`${this._getBaseUrl()}/access/delete/${access.id}`);
  };

  private _closeModals = () => {
    this.props.history.push(`${this._getBaseUrl()}/access`);
  };

  private _getBaseUrl = () => {
    return this.props.person
      ? `/${this.context.team.slug}/people/details/${this.props.person.id}`
      : `/${this.context.team.slug}`;
  };
}
