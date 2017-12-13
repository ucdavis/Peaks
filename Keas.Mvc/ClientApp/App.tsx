import PropTypes from "prop-types";
import * as React from "react";

import { IPerson } from "./Types";
import { createFetch } from "./util/api";

interface IProps {
    person: IPerson;
}

// Provider
export default class App extends React.Component<IProps, {}> {
    public static childContextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        teamId: PropTypes.number,
    };
    public getChildContext() {
        // define context here
        return {
            fetch: createFetch(),
            person: this.props.person,
            teamId: this.props.person.teamId,
        };
    }
    public render() {
        return <div>{this.props.children}</div>;
    }
}
