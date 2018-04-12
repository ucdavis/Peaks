import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace } from "../../Types";
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
        const spaces = await this.context.fetch(`/spaces/list?orgId=ADNO`);
        this.setState({ spaces });
    }
    public render() {
        return (
            <div>
                <SpacesList spaces={this.state.spaces} />
            </div>
        );
    }
}
