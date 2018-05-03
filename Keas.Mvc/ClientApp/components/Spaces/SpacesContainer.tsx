import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace } from "../../Types";
import SpacesDetails from "./SpacesDetails";
import SpacesList from "./SpacesList";

interface IState {
    spaces: ISpace[];
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
            spaces: []
        };
    }

    public async componentDidMount() {
        const spaces = await this.context.fetch(`/api/${this.context.team.name}/spaces/list?orgId=ADNO`);
        this.setState({ spaces });
    }
    public render() {

        const { action, assetType, id } = this.context.router.route.match.params;
        const activeAsset = !assetType || assetType === "spaces";
        const selectedId = parseInt(id, 10);
        const selectedSpace = this.state.spaces.find(k => k.id === selectedId);

        return (
            <div>
                <SpacesList
                    spaces={this.state.spaces}
                    showDetails={this._openDetailsModal} />
                <SpacesDetails
                    closeModal={this._closeModals}
                    modal={activeAsset && action === "details" && !!selectedSpace}
                    selectedSpace={selectedSpace}
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

    private _getBaseUrl = () => {
        return `/${this.context.team.name}`;
    };
}
