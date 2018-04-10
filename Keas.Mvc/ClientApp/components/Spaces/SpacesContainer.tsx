import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace } from "../../Types";
import SpacesListItem from "./SpacesListItem";

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
        const spaces = await this.context.fetch(`/spaces/list?id=ADNO`);
        this.setState({ spaces });
    }
    public render() {
        const spaceList = this.state.spaces.map(x => (
            <SpacesListItem key={x.roomKey} space={x} />));
        return (
            <div>
                {spaceList}
            </div>
        );
    }
}
