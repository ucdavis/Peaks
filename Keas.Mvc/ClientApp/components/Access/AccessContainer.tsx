import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";

import AccessDetails from "./AccessDetails";
import AccessList from "./AccessList";
import AssignAccess from "./AssignAccess";
import RevokeAccess from "./RevokeAccess";

interface IState {
    access: IAccess[]; // either access assigned to this person, or all team access
    loading: boolean;
}

interface IProps {
    person?: IPerson;
}

export default class AccessContainer extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
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
          ? `/api/${this.context.team.name}/access/listassigned?personId=${this.props.person.id}`
      : `/api/${this.context.team.name}/access/list/`;

    const access = await this.context.fetch(accessFetchUrl);
    this.setState({ access , loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
      }
    const { action, assetType, id } = this.context.router.route.match.params;
    const activeAsset = !assetType || assetType === "access";
    const selectedId = parseInt(id, 10);
    const detailAccess = this.state.access.find(a => a.id === selectedId);

    return (
      <div className="card">
        <div className="card-body">
                <h4 className="card-title">Access</h4>
                <AccessList
                    access={this.state.access}
                    personView={this.props.person ? true : false}
                    onRevoke={this._openRevokeModal}
                    onAdd={this._openAssignModal}
                    showDetails={this._openDetailsModal} />
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
        </div>
      </div>
    );
  }
  private _createAndMaybeAssignAccess = async (
      access: IAccess,
      date: any,
      person: IPerson
  ) => {
      // call API to create a access, then assign it if there is a person to assign to
      // if we are creating a new access
      if (access.id === 0) {
          access.teamId = this.context.team.id;
          access = await this.context.fetch(`/api/${this.context.team.name}/access/create`, {
              body: JSON.stringify(access),
              method: "POST"
          });
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
  private _closeModals = () => {
      this.context.router.history.push(`${this._getBaseUrl()}/access`);
  };

  private _getBaseUrl = () => {
      return this.props.person
          ? `/${this.context.team.name}/person/details/${this.props.person.id}`
          : `/${this.context.team.name}`;
  };

}
