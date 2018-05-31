import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace, ISpaceInfo } from "../../Types";
import WorkstationDetails from "../Workstations/WorkstationDetails";
import SpacesDetails from "./SpacesDetails";
import SpacesList from "./SpacesList";

interface IState {
    loading: boolean;
    spaces: ISpaceInfo[];
}
export default class SpacesContainer extends React.Component<{}, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            spaces: []
        };
    }

    public async componentDidMount() {
        const spaces = await this.context.fetch(`/api/${this.context.team.name}/spaces/list?orgId=ADNO`);
        this.setState({ loading: false, spaces });
    }
    public render() {

        if(this.state.loading) {
            return <h2>Loading...</h2>;
        }
        const { action, assetType, id } = this.context.router.route.match.params;
        const activeSpaceAsset = assetType === "spaces";
        const activeWorkstationAsset = assetType === "workstations";
        const selectedId = parseInt(id, 10);
        const selectedSpaceInfo = this.state.spaces.find(k => k.id === selectedId);

        return (
            <div>
                <SpacesList
                    spaces={this.state.spaces}
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
                    workstationId={Number.isInteger(selectedId) ? selectedId : null}
                    />
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

    private _getBaseUrl = () => {
        return `/${this.context.team.name}`;
    };
}
