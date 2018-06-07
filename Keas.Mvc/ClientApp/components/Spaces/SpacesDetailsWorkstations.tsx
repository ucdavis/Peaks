import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { Button } from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import WorkstationList from "./../Workstations/WorkstationList";

interface IProps {
    spaceId: number;
}

interface IState {
    loading: boolean;
    workstations: IWorkstation[];
}

export default class SpacesDetailsWorkstations extends React.Component<IProps, IState> {

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
        const workstations = this.props.spaceId === null ? [] :
            await this.context.fetch(`/api/${this.context.team.name}/workstations/getWorkstationsInSpace?spaceId=${this.props.spaceId}`);
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
            <div className="form-group">
                <h5><i className="fas fa-user fa-xs"></i> Workstations</h5>
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
                    Add Equipment
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
