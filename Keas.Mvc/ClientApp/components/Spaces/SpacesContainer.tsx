import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace, ISpaceInfo, IWorkstation } from "../../Types";
import SearchTags from "../Tags/SearchTags";
import SpacesDetails from "./SpacesDetails";
import SpacesTable from "./SpacesTable";
import Denied from "../Shared/Denied";
import { PermissionsUtil } from "../../util/permissions";

interface IState {
    spaces: ISpaceInfo[];
    loading: boolean;
    tableFilters: any[]; // object containing filters on table
    tagFilters: string[]; // array of filters from SearchTags
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
            loading: true,
            spaces: [],
            tableFilters: [],
            tagFilters: [],
            tags: [],
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
        const { spaceAction, spaceId, assetType, action, id } = this.context.router.route.match.params;
        const activeWorkstationAsset = assetType === "workstations";
        const selectedId = parseInt(spaceId, 10);
        const selectedSpaceInfo = this.state.spaces.find(k => k.id === selectedId);


        return (
        <div className="card spaces-color">
          <div className="card-header-spaces">
            <div className="card-head"><h2><i className="fas fa-building fa-xs"/> Spaces</h2></div>


          </div>

          <div className="card-content">

              {!spaceAction && !activeWorkstationAsset &&
                  this._renderTableView()
              }
              { spaceAction === "details" && (!!selectedSpaceInfo && !!selectedSpaceInfo.space) &&
                  this._renderDetailsView(selectedSpaceInfo.space)
              }

              </div>
          </div>
        );
    }

    // if we are at route teamName/spaces
    private _renderTableView = () => {
        let filteredSpaces = [];
        if(!!this.state.tagFilters && this.state.tagFilters.length > 0)
        {
            filteredSpaces = this.state.spaces.filter(x => this._checkFilters(x, this.state.tagFilters));
        }
        else
        {
            filteredSpaces = this.state.spaces;
        }
        return (
            <div>
            <SearchTags tags={this.state.tags} selected={this.state.tagFilters} onSelect={this._filterTags} disabled={false}/>
            <SpacesTable
                spaces={filteredSpaces}
                showDetails={this._openDetailsModal}
                filtered={this.state.tableFilters}
                updateFilters={this._updateTableFilters}
                />
            </div>
        );
    }

    // if we are at route teamName/spaces/details/spaceId
    private _renderDetailsView = (selectedSpace: ISpace) => {
        return(
            <SpacesDetails
                    closeModal={this._closeModals}
                    selectedSpace={selectedSpace}
                    tags={this.state.tags}
                    inUseUpdated={this._assetInUseUpdated}
                    totalUpdated={this._assetTotalUpdated}
                    edited={this._assetEdited}
                    />
        );
    }

    private _updateTableFilters = (filters: any[]) => {
        this.setState({tableFilters: filters});
    }

    private _openDetailsModal = (space: ISpace) => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/spaces/details/${space.id}`
        );
    };

    private _closeModals = () => {
        this.context.router.history.push(`${this._getBaseUrl()}/spaces`);
    };

    // managing counts for assigned or revoked
    private _assetInUseUpdated = (type: string, spaceId: number, personId: number, count: number) => {
        // this is called when we are assigning or revoking an asset
        const index = this.state.spaces.findIndex(x => x.id === spaceId);
        if(index > -1)
        {
            const spaces = [...this.state.spaces];
            switch(type) {
            case "workstation":
                spaces[index].workstationsInUse += count;
            }
            this.setState({spaces});
        }
    }

    private _assetTotalUpdated = (type: string, spaceId: number, personId: number, count: number) => {
        // this is called when we are either changing the room on an asset, or creating a workstation
        const index = this.state.spaces.findIndex(x => x.id === spaceId);
        if(index > -1)
        {
            const spaces = [...this.state.spaces];
            switch(type) {
                case "equipment": 
                spaces[index].equipmentCount += count;
                break;
                case "key":
                spaces[index].keyCount += count;
                break;
                case "workstation":
                spaces[index].workstationsTotal += count;
            }
            this.setState({spaces});
        } 
    }

    private _assetEdited = async (type: string, spaceId: number, personId: number) => {
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
        this.setState({tagFilters: filters});
    }

    private _checkFilters = (space: ISpaceInfo, filters: string[]) => {
        return filters.every(f => space.tags.includes(f));
    }
}
