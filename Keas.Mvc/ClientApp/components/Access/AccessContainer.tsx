import * as React from 'react';
import { RouteChildrenProps } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import {
  IAccess,
  IAccessAssignment,
  IMatchParams,
  IPerson,
} from '../../Types';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import SearchTags from '../Tags/SearchTags';
import AccessDetails from './AccessDetails';
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

export default class AccessContainer extends React.Component<
  RouteChildrenProps<IMatchParams>,
  IState
> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

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
    const accessFetchUrl = `/api/${this.context.team.slug}/access/list/`;
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

    accesses = accesses.map(a => ({
      ...a,
      assignments: a.assignments.map(assignment => ({
        ...assignment,
        access: a
      }))
    }))

    this.setState({ accesses, loading: false, tags });
  }
  public render() {
    if (!PermissionsUtil.canViewAccess(this.context.permissions)) {
      return <Denied viewName='Access' />;
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    const {
      containerAction,
      assetType,
      containerId,
    } = this.props.match.params;
    const activeAsset = !assetType || assetType === 'access';
    const selectedId = parseInt(containerId, 10)
    const detailAccess = this.state.accesses.find(a => a.id === selectedId);
    const shouldRenderDetails = !assetType && containerAction === 'details';

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
          {!shouldRenderDetails && this._renderTable()}
          {activeAsset &&
            (containerAction === 'assign' || containerAction === 'create') &&
            this._renderAssignModal(selectedId, detailAccess)}
          {shouldRenderDetails && this._renderDetails(selectedId, detailAccess)}
          {activeAsset &&
            containerAction === 'edit' &&
            this._renderEditModal(selectedId, detailAccess)}
          {activeAsset &&
            containerAction === 'delete' &&
            this._renderDeleteModal(selectedId, detailAccess)}
        </div>
      </div>
    );
  }

  private _renderTable = () => {
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
          onDelete={this._openDeleteModal}
          onAdd={this._openAssignModal}
          onEdit={this._openEditModal}
          showDetails={this._openDetails}
        />
      </div>
    );
  };

  private _renderAssignModal = (selectedId: number, access?: IAccess) => {
    return (
      <AssignAccess
        key={`assign-access-${selectedId}`}
        onCreate={this._createAndMaybeAssignAccess}
        modal={true}
        closeModal={this._closeModals}
        selectedAccess={access}
        tags={this.state.tags}
      />
    );
  };

  private _renderDetails = (selectedId: number, access: IAccess) => {
    return (
      <AccessDetails
        goBack={this.props.history.goBack}
        key={`details-access-${selectedId}`}
        selectedAccess={access}
        modal={!!access}
        closeModal={this._closeModals}
        openEditModal={this._openEditModal}
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
        tags={this.state.tags}
      />
    );
  };

  private _renderDeleteModal = (selectedId: number, access: IAccess) => {
    return (
      <DeleteAccess
        key={`delete-access-${selectedId}`}
        selectedAccess={access}
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
      // then push it
      access.assignments.push(accessAssignment);
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

  private _openCreateModal = () => {
    this.props.history.push(`${this._getBaseUrl()}/access/create`);
  };

  private _openDetails = (access: IAccess) => {
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
    return `/${this.context.team.slug}`;
  };
}
