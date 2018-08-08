import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { Button } from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import AssignWorkstation from "../Workstations/AssignWorkstation";
import EditWorkstation from "../Workstations/EditWorkstation";
import RevokeWorkstation from "../Workstations/RevokeWorkstation";
import WorkstationDetails from "../Workstations/WorkstationDetails";
import WorkstationList from "./../Workstations/WorkstationList";

interface IProps {
    spaceId?: number;
    personId?: number;
    tags: string[];
    workstationAssigned: (type: string, spaceId: number, personId: number, created: boolean, assigned: boolean) => void;
    workstationRevoked: (type: string, spaceId: number, personId: number) => void;
    workstationEdited: (type: string, spaceId: number, personId: number) => void; 
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
        if(!this.props.spaceId && !!this.props.personId)
        {
            workstations = 
                await this.context.fetch(`/api/${this.context.team.name}/workstations/getWorkstationsAssigned?personId=${this.props.personId}`);
        }
        if(!!this.props.spaceId && !this.props.personId)
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
        return (
            <div>
                {!!this.props.personId && !this.props.spaceId &&
                    this._renderPersonView()}
                {!this.props.personId && !!this.props.spaceId &&
                   this._renderSpaceView()
                }
            </div>
        );
    }

    private _renderPersonView = () => {

        return(
        <div className="card">
            <div className="card-body">
            <h4 className="card-title"><i className="fas fa-user fa-xs"/> Workstations</h4>
                {this._renderWorkstations()}
            </div>
            </div>);
    }

    private _renderSpaceView = () => {
        return(
        <div className="form-group">
            <h5><i className="fas fa-key fa-xs"/> Workstations</h5>
            {this._renderWorkstations()}
        </div>
            );
    }

    private _renderWorkstations = () => {
        const { action, assetType, id } = this.context.router.route.match.params;
        const activeAsset = assetType === "workstations";
        const selectedId = parseInt(id, 10);
        const selectedSpaceInfo = this.state.workstations.find(k => k.id === selectedId);

        return(
            <div>
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
                    workstationId={activeAsset && Number.isInteger(selectedId) ? selectedId : null}
                    />
                <EditWorkstation
                    closeModal={this._closeModals}
                    tags={this.props.tags}
                    modal={activeAsset && action === "edit"}
                    workstationId={activeAsset && Number.isInteger(selectedId) ? selectedId : null}
                    editWorkstation={this.props.workstationEdited}
                    />
                <AssignWorkstation
                    closeModal={this._closeModals}
                    updateCount={this.props.workstationAssigned}
                    modal={activeAsset && action === "assign" || action ==="create"}
                    workstationId={activeAsset && action === "assign" && Number.isInteger(selectedId) ? selectedId : null}
                    spaceId={activeAsset && action === "create" && Number.isInteger(selectedId) ? selectedId : null}
                    tags={this.props.tags}
                    creating={action === "create"} />
                <RevokeWorkstation
                    closeModal={this._closeModals}
                    updateCount={this.props.workstationRevoked}
                    modal={activeAsset && action === "revoke"}
                    workstationId={activeAsset && Number.isInteger(selectedId) ? selectedId : null} />
            </div>
        );
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
            `${this._getBaseUrl()}/workstations/create/${this.props.spaceId}`
        );
    };

    private _openRevokeModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/workstations/revoke/${workstation.id}`
        );    
    }

    private _closeModals = () => {
        if(!!this.props.personId && !this.props.spaceId)
        {
            this.context.router.history.push(`${this._getBaseUrl()}/people`);
        }
        else if(!this.props.personId && !!this.props.spaceId)
        {
            this.context.router.history.push(`${this._getBaseUrl()}/spaces`);
        }
    };
    
    private _getBaseUrl = () => {
        return this.props.personId
          ? `/${this.context.team.name}/people/details/${this.props.personId}`
          : `/${this.context.team.name}/spaces/details/${this.props.spaceId}`;
      };
}
