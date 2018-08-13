import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace, ISpaceInfo, IWorkstation } from "../../Types";
import SearchTags from "../Tags/SearchTags";
import AssignWorkstation from "../Workstations/AssignWorkstation";
import EditWorkstation from "../Workstations/EditWorkstation";
import RevokeWorkstation from "../Workstations/RevokeWorkstation";
import WorkstationDetails from "../Workstations/WorkstationDetails";
import SpacesDetails from "./SpacesDetails";
import SpacesList from "./SpacesList";
import Denied from "../Shared/Denied";
import { PermissionsUtil } from "../../util/permissions"; 

interface IState {
    spaces: ISpaceInfo[];
    filters: string[];
    loading: boolean;
    tags: string[];
}
export default class SpacesContainer extends React.Component<{}, IState> {
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
            filters: [],
            loading: true,
            spaces: [],
            tags: []
        };
    }

    public async componentDidMount() {
        const spaces = await this.context.fetch(`/api/${this.context.team.name}/spaces/list?orgId=ADNO`);
        const tags = await this.context.fetch(`/api/${this.context.team.name}/tags/listTags`);
        this.setState({ loading: false, spaces, tags });
    }
    public render() {
        const permissionArray = ['SpaceMaster', 'DepartmentalAdmin', 'Admin'];
        if (!PermissionsUtil.canViewSpace(this.context.permissions)) {
            return (
                <Denied viewName="Space" />
            );
        }

        if(this.state.loading) {
            return <h2>Loading...</h2>;
        }
        const { action, assetType, id } = this.context.router.route.match.params;
        const activeSpaceAsset = assetType === "spaces";
        const activeWorkstationAsset = assetType === "workstations";
        const selectedId = parseInt(id, 10);
        const selectedSpaceInfo = this.state.spaces.find(k => k.id === selectedId);
        let filteredSpaces = [];
        if(!!this.state.filters && this.state.filters.length > 0)
        {
            filteredSpaces = this.state.spaces.filter(x => this._checkFilters(x, this.state.filters));
        }
        else 
        {
            filteredSpaces = this.state.spaces;
        }

        return (
        <div className="card">
            <div className="card-body">
                <h4 className="card-title">Spaces</h4>
                <SearchTags tags={this.state.tags} selected={this.state.filters} onSelect={this._filterTags} disabled={false}/>
                <SpacesList
                    spaces={filteredSpaces}
                    showDetails={this._openDetailsModal} />
                <SpacesDetails
                    closeModal={this._closeModals}
                    modal={activeSpaceAsset && action === "details" && (!!selectedSpaceInfo && !!selectedSpaceInfo.space)}
                    selectedSpace={selectedSpaceInfo ? selectedSpaceInfo.space : null}
                    />
                <WorkstationDetails
                    closeModal={this._closeModals}
                    returnToSpaceDetails={this._returnToSpaceDetails}
                    modal={activeWorkstationAsset && action === "details"}
                    workstationId={activeWorkstationAsset && Number.isInteger(selectedId) ? selectedId : null}
                    />
                <EditWorkstation
                    closeModal={this._closeModals}
                    returnToSpaceDetails={this._returnToSpaceDetails}
                    tags={this.state.tags}
                    modal={activeWorkstationAsset && action === "edit"}
                    workstationId={activeWorkstationAsset && Number.isInteger(selectedId) ? selectedId : null}
                    editWorkstation={this._workstationEdited}
                    />
                <AssignWorkstation
                    closeModal={this._closeModals}
                    updateCount={this._workstationAssigned}
                    returnToSpaceDetails={this._returnToSpaceDetails}
                    modal={activeWorkstationAsset && action === "assign" || action ==="create"}
                    workstationId={activeWorkstationAsset && action === "assign" && Number.isInteger(selectedId) ? selectedId : null}
                    spaceId={activeWorkstationAsset && action === "create" && Number.isInteger(selectedId) ? selectedId : null}
                    tags={this.state.tags}
                    creating={action === "create"} />
                <RevokeWorkstation
                    closeModal={this._closeModals}
                    updateCount={this._workstationRevoked}
                    returnToSpaceDetails={this._returnToSpaceDetails}
                    modal={activeWorkstationAsset && action === "revoke"}
                    workstationId={activeWorkstationAsset && Number.isInteger(selectedId) ? selectedId : null} />
                </div>
            </div>
        );
    }

    private _openDetailsModal = (space: ISpace) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/spaces/details/${space.id}`
        );
    };

    private _closeModals = () => {
        this.context.router.history.push(`${this._getBaseUrl()}/spaces`);
    };

    private _returnToSpaceDetails = (spaceId: number) => {
        this.context.router.history.push(`${this._getBaseUrl()}/spaces/details/${spaceId}`);
    }

    private _workstationAssigned = (spaceId: number, created: boolean, assigned: boolean) => {
        const index = this.state.spaces.findIndex(x => x.id === spaceId);
        if(index > -1)
        {
            const spaces = [...this.state.spaces];
            if(created)
            {
                spaces[index].workstationsTotal++;
            }
            if(assigned)
            {
                spaces[index].workstationsInUse++;
            }
            this.setState({spaces});
        } 
    }

    private _workstationRevoked = (spaceId: number) => {
        const index = this.state.spaces.findIndex(x => x.id === spaceId);
        if(index > -1)
        {
            const spaces = [...this.state.spaces];
            spaces[index].workstationsInUse--;
            this.setState({spaces});
        }     
    }

    private _workstationEdited = async (spaceId: number) => {
        const index = this.state.spaces.findIndex(x => x.id === spaceId);
        if(index > -1 )
        {
            const tags = await this.context.fetch(`/api/${this.context.team.name}/spaces/getTagsInSpace?spaceId=${spaceId}`);
            const spaces = [...this.state.spaces];
            spaces[index].tags = tags;
            this.setState({spaces});  
        }
    }

    private _getBaseUrl = () => {
        return `/${this.context.team.name}`;
    };

    private _filterTags = (filters: string[]) => {
        this.setState({filters});
    }

    private _checkFilters = (space: ISpaceInfo, filters: string[]) => {
        return filters.every(f => space.tags.includes(f));
    }
}
