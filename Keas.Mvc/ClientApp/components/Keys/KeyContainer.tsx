import * as React from "react";
import PropTypes from "prop-types";

import { IPerson, IKey, IKeyAssignment, AppContext } from "../../Types";

import AssignKey from "./AssignKey";
import KeyList from "./KeyList";

interface IState {
    loading: boolean;
    keyAssignments: IKeyAssignment[];
}

export default class KeyContainer extends React.Component<{}, IState> {
    static contextTypes = {
        person: PropTypes.object,
        fetch: PropTypes.func
    };
    context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            keyAssignments: []
        };
    }
    async componentDidMount() {
        const keyAssignments = await this.context.fetch(
            `/keys/listassigned/${this.context.person.id}`
        );
        this.setState({ keyAssignments, loading: false });
    }
    public render() {
        if (this.state.loading) return <h2>Loading...</h2>;
        return (
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">Keys</h4>
                    <AssignKey onCreate={this._createAndAssignKey} />
                    <KeyList keyAssignments={this.state.keyAssignments} />
                </div>
            </div>
        );
    }
    _createAndAssignKey = async (key: IKey) => {
        // call API to create a key, then assign it

        // TODO: basically all fake, make it real
        const newKey: IKey = await this.context.fetch("/keys/create", {
            method: "POST",
            body: JSON.stringify(key)
        });

        const assignUrl = `/keys/assign?keyId=${newKey.id}&personId=${
            this.context.person.id
        }`;
        const newAssignment: IKeyAssignment = await this.context.fetch(
            assignUrl,
            { method: "POST" }
        );
        newAssignment.key = newKey;

        this.setState({
            keyAssignments: [...this.state.keyAssignments, newAssignment]
        });
    };
}
