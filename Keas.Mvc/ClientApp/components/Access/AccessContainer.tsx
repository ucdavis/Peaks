import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess, IPerson } from "../../Types";

import AssignAccess from "./AssignAccess";
import AccessList from "./AccessList";
import AccessDetails from "./AccessDetails";

interface IState {
    loading: boolean;
    //either access assigned to this person, or all team access
    access: IAccess[];
    selectedAccess: IAccess;
    assignModal: boolean;
    detailsModal: boolean;
    addingAccess: boolean;
}

export default class AccessContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
        access: [],
        selectedAccess: null,
        loading: true,
        assignModal: false,
        detailsModal: false,
        addingAccess: true,
    };
  }
  public async componentDidMount() {
      // are we getting the person's access or the team's?
      const accessFetchUrl = this.context.person
          ? `/access/listassigned?id=${this.context.person.id}&teamId=${this.context.person.teamId}`
      : `/access/list?teamId=${this.context.team.id}`;

    const access = await this.context.fetch(accessFetchUrl);
    this.setState({ access , loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
      }
    const assignedAccessList = this.context.person ? this.state.access.map(x => x.name) : null;
    const allAccessList = this.context.person ? null : this.state.access;
    return (
      <div className="card">
        <div className="card-body">
                <h4 className="card-title">Access</h4>
                <AccessList
                    access={this.state.access}
                    personView={this.context.person !== null}
                    onRevoke={this._openRevokeModal}
                    onAdd={this._assignSelectedAccess}
                    showDetails={this._openDetailsModal} />
                <AssignAccess
                    onCreate={this._createAndMaybeAssignAccess}
                    onRevoke={this._revokeAccess}
                    adding={this.state.addingAccess}
                    modal={this.state.assignModal}
                    openModal={this._openAssignModal}
                    closeModal={this._closeAssignModal}
                    selectedAccess={this.state.selectedAccess}
                    selectAccess={this._selectAccess}
                    changeProperty={this._changeSelectedAccessProperty}
                />
                <AccessDetails selectedAccess={this.state.selectedAccess} modal={this.state.detailsModal} closeModal={this._closeDetailsModal} />
        </div>
      </div>
    );
  }
  private _createAndMaybeAssignAccess = async (person: IPerson, date: any) => {
      // call API to create a access, then assign it if there is a person to assign to
      var access = this.state.selectedAccess;
      //if we are creating a new access
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

    let index = this.state.access.findIndex(x => x.id == access.id);
    console.log("index " + index);
    if (index !== -1) {
        console.log("changing");
        //update already existing entry in access
        let updateAccess = [...this.state.access];
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

  private _revokeAccess = async (person: IPerson) => {

      var access = this.state.selectedAccess;
      // call API to actually revoke
      const revokeUrl = `/access/revoke?accessId=${access.id}&personId=${person.id}`
      const removed: IAccess = await this.context.fetch(revokeUrl, {
          method: "POST"
      });

      //remove from state
      const index = this.state.access.indexOf(access);
      if (index > -1) {
          let shallowCopy = [...this.state.access];
          if (this.context.person == null) {
              //if we are looking at all access, just update assignment
              shallowCopy[index] = removed;
          }
          else {
              //if we are looking at a person, remove from our list of access
              shallowCopy.splice(index, 1);
          }
          this.setState({ access: shallowCopy });
      }
  }

    //pulls up assign modal from dropdown action
  private _assignSelectedAccess = (access: IAccess) => {
      this.setState({ selectedAccess: access });
      this._openAssignModal();
  }

  private _openAssignModal = async () => {
      this.setState({ assignModal: true, addingAccess: true});
  };

  //clear everything out on close
  private _closeAssignModal = () => {
      this.setState({
          assignModal: false,
          selectedAccess: null,
      });
  };
  private _openRevokeModal = (access: IAccess) => {
      this.setState({ assignModal: true, addingAccess: false, selectedAccess: access });
  }
    //used in assign access 
  private _selectAccess = (access: IAccess) => {
      this.setState({ selectedAccess: access });
  }

  private _changeSelectedAccessProperty = (property: string, value: string) => {
      this.setState({
          selectedAccess: {
              ...this.state.selectedAccess,
              [property]: value
          }
          });
  }

  private _openDetailsModal = (access: IAccess) => {
      this.setState({ detailsModal: true, selectedAccess: access });
  }
  private _closeDetailsModal = () => {
      this.setState({ detailsModal: !this.state.detailsModal, selectedAccess: null });
  }

}
