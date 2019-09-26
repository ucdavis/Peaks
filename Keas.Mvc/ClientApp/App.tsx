import * as PropTypes from "prop-types";
import * as React from "react";

import { IPerson, ITeam } from "./Types";
import { createFetch } from "./util/api";

import { History } from "history";

interface IProps {
    team: ITeam;
    permissions: string[];
    antiForgeryToken: string;
}

// Provider
export default class App extends React.Component<IProps, {}> {
    public static childContextTypes = {
        fetch: PropTypes.func,
        permissions: PropTypes.array,
        team: PropTypes.object
    };
    public getChildContext() {
        // define context here
        return {
            fetch: createFetch(this.props.antiForgeryToken),
            permissions: this.props.permissions,
            team: this.props.team
        };
    }
    public render() {
        return <div>{this.props.children}</div>;
    }
}
