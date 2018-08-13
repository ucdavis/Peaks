import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { Button } from "reactstrap";
import { AppContext, IWorkstation, IPerson } from "../../Types";
import AssignWorkstation from "../Workstations/AssignWorkstation";
import EditWorkstation from "../Workstations/EditWorkstation";
import RevokeWorkstation from "../Workstations/RevokeWorkstation";
import WorkstationDetails from "../Workstations/WorkstationDetails";
import WorkstationList from "./../Workstations/WorkstationList";

interface IProps {
    spaceId?: number;
    person?: IPerson;
    tags: string[];
    workstationInUseUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
    workstationTotalUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
    workstationEdited?: (type: string, spaceId: number, personId: number) => void; 
}

interface IState {
    loading: boolean;
    workstations: IWorkstation[];
}

export default class WorkstationContainer extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            workstations: [],
        };
    }

    public async componentDidMount() {
        this.setState({ loading: true });
        let workstations = [];
        if(!this.props.spaceId && !!this.props.person)
        {
            workstations = 
                await this.context.fetch(`/api/${this.context.team.name}/workstations/getWorkstationsAssigned?personId=${this.props.person.id}`);
        }
        if(!!this.props.spaceId && !this.props.person)
        {
            workstations = 
                await this.context.fetch(`/api/${this.context.team.name}/workstations/getWorkstationsInSpace?spaceId=${this.props.spaceId}`);
        }
        this.setState({ workstations, loading: false });
    }

    public render() {
        if (this.props.spaceId === null)
        {
            return null;
        }
        if (this.state.loading)
        {
            return (<div>Loading Workstations...</div>);
        }
        const { action, assetType, id } = this.context.router.route.match.params;
        const activeAsset = assetType === "workstations";
        const selectedId = parseInt(id, 10);
        const selectedWorkstation = this.state.workstations.find(k => k.id === selectedId);

        return (
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title"><i className="fas fa-user fa-xs"/> Workstations</h4>
                        {this.state.workstations.length > 0 ? 
                            <WorkstationList 
                                    workstations={this.state.workstations} 
                                    showDetails={this._openDetailsModal}
                                    onEdit={this._openEditModal}
                                    onAdd={this._openAssignModal} 
                                    onCreate={this._openCreateModal}
                                    onRevoke={this._openRevokeModal}/> : <div>No Workstations</div>}
                            <Button color="danger" onClick={() => this._openCreateModal()}>
                                Add Workstation
                            </Button>
                            <WorkstationDetails
                                closeModal={this._closeModals}
                                modal={activeAsset && action === "details"}
                                selectedWorkstation={selectedWorkstation}
                                />
                            <EditWorkstation
                                closeModal={this._closeModals}
                                tags={this.props.tags}
                                modal={activeAsset && action === "edit"}
                                selectedWorkstation={selectedWorkstation}
                                onEdit={this._editWorkstation}
                                />
                            <AssignWorkstation
                                closeModal={this._closeModals}
                                modal={activeAsset && (action === "assign" || action ==="create")}
                                person={this.props.person}
                                selectedWorkstation={selectedWorkstation}
                                tags={this.props.tags}
                                onCreate={this._createAndMaybeAssignWorkstation}
                                onAddNew={this._openCreateModal} />
                            <RevokeWorkstation
                                closeModal={this._closeModals}
                                revokeWorkstation={this._revokeWorkstation}
                                modal={activeAsset && action === "revoke"}
                                selectedWorkstation={selectedWorkstation} />
                </div>
            </div>
        );
    }

    private _createAndMaybeAssignWorkstation = async (
        person: IPerson,
        workstation: IWorkstation,
        date: any
      ) => {
        let created = false;
        let assigned = false;
        
        // call API to create a workstation, then assign it if there is a person to assign to
        // if we are creating a new workstation
        if (workstation.id === 0) {
          workstation.teamId = this.context.team.id;
          workstation = await this.context.fetch(`/api/${this.context.team.name}/workstations/create`, {
            body: JSON.stringify(workstation),
            method: "POST"
          });
          created = true;
        }
    
        // if we know who to assign it to, do it now
        if (person) {
          const assignUrl = `/api/${this.context.team.name}/workstations/assign?workstationId=${workstation.id}&personId=${
            person.id
          }&date=${date}`;
    
          workstation = await this.context.fetch(assignUrl, {
            method: "POST"
          });
          workstation.assignment.person = person;
          assigned = true;
        }
    
        const index = this.state.workstations.findIndex(x => x.id === workstation.id);
        if (index !== -1) {
          // update already existing entry in workstation
          const updateWorkstation = [...this.state.workstations];
          updateWorkstation[index] = workstation;
    
          this.setState({
            ...this.state,
            workstations: updateWorkstation
          });
        } else {
          this.setState({
            workstations: [...this.state.workstations, workstation]
          });
        }
        if(created)
        {
            this.props.workstationTotalUpdated("workstation", this.props.spaceId, this.props.person? this.props.person.id : null, 1);
        }
        if(assigned)
        {
            this.props.workstationInUseUpdated("workstation", this.props.spaceId, this.props.person ? this.props.person.id : null, 1);
        }

      };
    
      private _revokeWorkstation = async (workstation: IWorkstation) => {
        // call API to actually revoke
        const removed: IWorkstation = await this.context.fetch(`/api/${this.context.team.name}/workstations/revoke`, {
          body: JSON.stringify(workstation),
          method: "POST"
        });
     
        // remove from state
        const index = this.state.workstations.indexOf(workstation);
        if (index > -1) {
          const shallowCopy = [...this.state.workstations];
          if (!this.props.person && !!this.props.spaceId) {
              // if we are looking at all workstation, just update assignment
           shallowCopy[index].assignment = null;
          } else {
            // if we are looking at a person, remove from our list of workstation
            shallowCopy.splice(index, 1);
          }
          this.setState({ workstations: shallowCopy });

          if(this.props.workstationInUseUpdated)
          {
            this.props.workstationInUseUpdated("workstation", this.props.spaceId, this.props.person ? this.props.person.id : null, -1);
          }
        }
      };
    
      private _editWorkstation = async (workstation: IWorkstation) =>
      {
        const index = this.state.workstations.findIndex(x => x.id === workstation.id);
        debugger;
        if(index === -1 ) // should always already exist
        {
          return;
        }
        const updated: IWorkstation = await this.context.fetch(`/api/${this.context.team.name}/workstations/update`, {
          body: JSON.stringify(workstation),
          method: "POST"
        });
        debugger;
        // if the space has been edited
        if(workstation.space.id !== this.state.workstations[index].space.id)
        {
            debugger;
            console.log(workstation.space.id);
            console.log(this.state.workstations[index].space.id);
            // remove one from total of old space
            this.props.workstationTotalUpdated("workstation", this.state.workstations[index].space.id,
                this.props.person ? this.props.person.id : null, -1);
            // and add one to total of new space
            this.props.workstationTotalUpdated("workstation", workstation.space.id,
                this.props.person ? this.props.person.id : null, 1);
            if(!!workstation.assignment)
            {
                // remove one from in use of old space
                this.props.workstationInUseUpdated("workstation", this.state.workstations[index].space.id,
                    this.props.person ? this.props.person.id : null, -1);
                // and add one to in use of new space
                this.props.workstationInUseUpdated("workstation", workstation.space.id,
                    this.props.person ? this.props.person.id : null, 1);
            }
        }
        updated.assignment = workstation.assignment;
    
        // update already existing entry in key
        const updateWorkstation = [...this.state.workstations];
        updateWorkstation[index] = updated;
    
        this.setState({
          ...this.state,
          workstations: updateWorkstation
        }); 

        if(!!this.props.workstationEdited)
        {
            this.props.workstationEdited("workstation", this.props.spaceId, !!this.props.person ? this.props.person.id : null);
        }
      }

    private _openDetailsModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/workstations/details/${workstation.id}`
        );
    };
    
    private _openEditModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/workstations/edit/${workstation.id}`
        );
    };

    private _openAssignModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/workstations/assign/${workstation.id}`
        );
    };

    private _openCreateModal = () => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/workstations/create/`
        );
    };

    private _openRevokeModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/workstations/revoke/${workstation.id}`
        );    
    }

    private _closeModals = () => {
        if(!!this.props.person && !this.props.spaceId)
        {
            this.context.router.history.push(`${this._getBaseUrl()}`);
        }
        else if(!this.props.person && !!this.props.spaceId)
        {
            this.context.router.history.push(`${this._getBaseUrl()}`);
        }
    };
    
    private _getBaseUrl = () => {
        return this.props.person
          ? `/${this.context.team.name}/people/details/${this.props.person.id}`
          : `/${this.context.team.name}/spaces/details/${this.props.spaceId}`;
      };
}
