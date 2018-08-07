import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { Button } from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import WorkstationList from "./../Workstations/WorkstationList";

interface IProps {
    spaceId?: number;
    personId?: number;
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
                {this.state.workstations.length > 0 ? 
                    <WorkstationList 
                            workstations={this.state.workstations} 
                            showDetails={this._openDetailsModal}
                            onEdit={this._openEditModal}
                            onAdd={this._openAssignModal} 
                            onCreate={this._openCreateModal}
                            onRevoke={this._openRevokeModal}/> : "No Workstations"}
                    <Button color="danger" onClick={() => this._openCreateModal()}>
                        Add Workstation
                    </Button>
                </div>
            </div>);
    }

    private _renderSpaceView = () => {
        return(
        <div className="form-group">
            <h5><i className="fas fa-key fa-xs"/> Workstations</h5>
            <div>
            {this.state.workstations.length > 0 ? 
                <WorkstationList 
                    workstations={this.state.workstations} 
                    showDetails={this._openDetailsModal}
                    onEdit={this._openEditModal}
                    onAdd={this._openAssignModal} 
                    onCreate={this._openCreateModal}
                    onRevoke={this._openRevokeModal}/> : "No Workstations"}
                    </div>
                    <Button color="danger" onClick={() => this._openCreateModal()}>
                        Add Workstation
                    </Button>
        </div>
            );
    }

    private _openDetailsModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `../../workstations/details/${workstation.id}`
        );
    };
    
    private _openEditModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `../../workstations/edit/${workstation.id}`
        );
    };

    private _openAssignModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `../../workstations/assign/${workstation.id}`
        );
    };

    private _openCreateModal = () => {
        this.context.router.history.push(
            `../../workstations/create/${this.props.spaceId}`
        );
    };

    private _openRevokeModal = (workstation: IWorkstation) => {
        this.context.router.history.push(
            `../../workstations/revoke/${workstation.id}`
        );    
    }
    
}
