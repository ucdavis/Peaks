import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess, IPerson } from "../../Types";

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
          ? `/access/listassigned?id=${this.props.person.id}&teamId=${this.props.person.teamId}`
      : `/access/list?teamId=${this.context.team.id}`;

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
          access = await this.context.fetch("/access/create", {
              body: JSON.stringify(access),
              method: "POST"
          });
      }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;

      access = await this.context.fetch(assignUrl, {
        method: "POST"
      });
      }

    const index = this.state.access.findIndex(x => x.id === access.id);
    console.log("index " + index);
    if (index !== -1) {
        console.log("changing");
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

  private _revokeAccess = async (access: IAccess, person?: IPerson) => {

      // call API to actually revoke
      const revokeUrl = `/access/revoke?accessId=${access.id}&personId=${!!this.props.person ? this.props.person.id : person.id}`
      const removed: IAccess = await this.context.fetch(revokeUrl, {
          method: "POST"
      });

      // remove from state
      const index = this.state.access.indexOf(access);
      if (index > -1) {
          const shallowCopy = [...this.state.access];
          if (this.props.person == null) {
              // if we are looking at all access, just update assignment
              shallowCopy[index] = removed;
          }
          else {
              // if we are looking at a person, remove from our list of access
              shallowCopy.splice(index, 1);
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
          this._revokeAccess(access, this.props.person);
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
