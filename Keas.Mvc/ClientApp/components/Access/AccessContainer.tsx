import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";

import AccessDetails from "./AccessDetails";
import AccessList from "./AccessList";
import AssignAccess from "./AssignAccess";
import EditAccess from "./EditAccess";
import RevokeAccess from "./RevokeAccess";
import Denied from "../Shared/Denied";
import { PermissionsUtil } from "../../util/permissions";

interface IState {
    access: IAccess[]; // either access assigned to this person, or all team access
    loading: boolean;
}

interface IProps {
    assetInUseUpdated?: (type: string, spaceId: number, personId: number, count: number) => void;
    assetTotalUpdated?: (type: string, spaceId: number, personId: number, count: number) => void;
    assetEdited?: (type: string, spaceId: number, personId: number) => void; 
    person?: IPerson;
    spaceId?: number;
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
        access: [],
        loading: true,
    };
  }
  public async componentDidMount() {
      // are we getting the person's access or the team's?
      const accessFetchUrl = this.props.person
          ? `/api/${this.context.team.name}/access/listAssigned?personId=${this.props.person.id}`
      : `/api/${this.context.team.name}/access/list/`;

    const access = await this.context.fetch(accessFetchUrl);
    this.setState({ access , loading: false });
  }
  public render() {
      if (!PermissionsUtil.canViewAccess(this.context.permissions)) {
        return (
            <Denied viewName="Access" />
        );
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
      }
    const { action, assetType, id } = this.context.router.route.match.params;
    const activeAsset = !assetType || assetType === "access";
    const selectedId = parseInt(id, 10);
    const detailAccess = this.state.access.find(a => a.id === selectedId);

    return (
      <div className="card access-color">
        <div className="card-header-access">
          <div className="card-head"><h2><i className="fas fa-address-card fa-xs"/> Access</h2></div>
        </div>
        <div className="card-content">
                <AccessList
                    access={this.state.access}
                    personView={this.props.person ? true : false}
                    onRevoke={this._openRevokeModal}
                    onAdd={this._openAssignModal}
                    onEdit={this._openEditModal}
                    showDetails={this._openDetailsModal}
                     />
                <AssignAccess
                    onAddNew={this._openCreateModal}
                    onCreate={this._createAndMaybeAssignAccess}
                    modal={activeAsset && (action === "create" || action === "assign")}
                    closeModal={this._closeModals}
                    selectedAccess={detailAccess}
                    person={this.props.person}
                />
                <RevokeAccess
                    closeModal={this._closeModals}
                    modal={activeAsset && action === "revoke"}
                    selectedAccess={detailAccess}
                    onRevoke={this._revokeAccess}
                />
                <AccessDetails selectedAccess={detailAccess}
                    modal={activeAsset && action === "details" && !!detailAccess}
                    closeModal={this._closeModals} />
                <EditAccess
                    onEdit={this._editAccess}
                    closeModal={this._closeModals}
                    modal={activeAsset && (action === "edit")}
                    selectedAccess={detailAccess}
                    />
        </div>
      </div>
    );
  }
  private _createAndMaybeAssignAccess = async (
      access: IAccess,
      date: any,
      person: IPerson
  ) => {
      let created = false;
      let assigned = false;
      // call API to create a access, then assign it if there is a person to assign to
      // if we are creating a new access
      if (access.id === 0) {
          access.teamId = this.context.team.id;
          access = await this.context.fetch(`/api/${this.context.team.name}/access/create`, {
              body: JSON.stringify(access),
              method: "POST"
          });
          created = true;
      }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${this.context.team.name}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;

      const accessAssignment = await this.context.fetch(assignUrl, {
        method: "POST"
      });
      // fetching only returns the assignment, so add it to the access in our state with the right person
      accessAssignment.person = person;
      if (!!this.props.person)
      {
          // if we are on a person page, replace any fetched assignments with this one
          access.assignments = [];
      }
      // then push it
      access.assignments.push(accessAssignment);
      assigned = true;
    }

    const index = this.state.access.findIndex(x => x.id === access.id);
    if (index !== -1) {
        // update already existing entry in access
        const updateAccess = [...this.state.access];
        updateAccess[index] = access;

        this.setState({
            ...this.state,
            access: updateAccess,
        });
    }
    else {
        this.setState({
            access: [...this.state.access, access]
        });
    }
    if(created && this.props.assetTotalUpdated)
    {
        this.props.assetTotalUpdated("access", this.props.spaceId, this.props.person ? this.props.person.id : null, 1);
    }
    if(assigned && this.props.assetInUseUpdated)
    {
        this.props.assetInUseUpdated("access", this.props.spaceId, this.props.person ? this.props.person.id : null, 1);
    }
  };

  private _revokeAccess = async (accessAssignment: IAccessAssignment) => {

      // call API to actually revoke
      const removed: IAccess = await this.context.fetch(`/api/${this.context.team.name}/access/revoke`, {
          body: JSON.stringify(accessAssignment),
          method: "POST"
      });

      // find index of access in state
      const accessIndex = this.state.access.findIndex(x => x.id === accessAssignment.accessId);
      if (accessIndex > -1) {
          const shallowCopy = [...this.state.access];
          if (this.props.person == null) {
              // if we are looking at all access, remove from access.assignments
              const assignmentIndex = shallowCopy[accessIndex].assignments.indexOf(accessAssignment);
              shallowCopy[accessIndex].assignments.splice(assignmentIndex, 1);
          }
          else {
              // if we are looking at a person, remove access entirely
              shallowCopy.splice(accessIndex, 1);
          }
        this.setState({ access: shallowCopy });

        if(this.props.assetInUseUpdated)
        {
            this.props.assetInUseUpdated("access", this.props.spaceId, this.props.person ? this.props.person.id : null, -1);
        }
      }
  }

  private _editAccess = async (access: IAccess) =>
  {
    const index = this.state.access.findIndex(x => x.id === access.id);

    if(index === -1 ) // should always already exist
    {
      return;
    }

    const updated: IAccess = await this.context.fetch(`/api/${this.context.team.name}/access/update`, {
      body: JSON.stringify(access),
      method: "POST"
    });

    // update already existing entry in key
    const updateAccess = [...this.state.access];
    updateAccess[index] = updated;

    this.setState({
      ...this.state,
      access: updateAccess
    });

    if(this.props.assetEdited)
    {
        this.props.assetEdited("access", this.props.spaceId, !!this.props.person ? this.props.person.id : null);
    }
  }

  private _openAssignModal = (access: IAccess) => {
      this.context.router.history.push(
          `${this._getBaseUrl()}/access/assign/${access.id}`
      );
  };

  private _openRevokeModal = (access: IAccess) => {
      if (!!this.props.person) // if we already have the person, just revoke
      {
          const accessIndex = this.state.access.indexOf(access);
          const accessAssignment = this.state.access[accessIndex].assignments.filter(x => x.personId === this.props.person.id);
          this._revokeAccess(accessAssignment[0]);
      }
      else // otherwise, pull up the modal
      {
          this.context.router.history.push(`${this._getBaseUrl()}/access/revoke/${access.id}`);
      }
  }

  private _openCreateModal = () => {
      this.context.router.history.push(`${this._getBaseUrl()}/access/create`);
  };

  private _openDetailsModal = (access: IAccess) => {
      this.context.router.history.push(
          `${this._getBaseUrl()}/access/details/${access.id}`
      );
  };

  private _openEditModal = (access: IAccess) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/access/edit/${access.id}`
    );
  };

  private _closeModals = () => {
      this.context.router.history.push(`${this._getBaseUrl()}/access`);
  };

  private _getBaseUrl = () => {
      return this.props.person
          ? `/${this.context.team.name}/people/details/${this.props.person.id}`
          : `/${this.context.team.name}`;
  };

}
