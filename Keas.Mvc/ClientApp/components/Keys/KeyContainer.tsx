import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IKeyAssignment, IPerson } from "../../Types";

import AssignKey from "./AssignKey";
import KeyList from "./KeyList";

interface IState {
    loading: boolean;
    keyAssignments: IKeyAssignment[];
}

export default class KeyContainer extends React.Component<{}, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            keyAssignments: [],
            loading: true,
        };
    }
    public async componentDidMount() {
        const keyAssignments = await this.context.fetch(
            `/keys/listassigned/${this.context.person.id}`,
        );
        this.setState({ keyAssignments, loading: false });
    }
    public render() {
        if (this.state.loading) {
            return <h2>Loading...</h2>;
        }
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
    public _createAndAssignKey = async (key: IKey) => {
        // call API to create a key, then assign it

        // TODO: basically all fake, make it real
        const newKey: IKey = await this.context.fetch("/keys/create", {
            body: JSON.stringify(key),
            method: "POST",
        });

        const assignUrl = `/keys/assign?keyId=${newKey.id}&personId=${
            this.context.person.id
        }`;
        const newAssignment: IKeyAssignment = await this.context.fetch(
            assignUrl,
            { method: "POST" },
        );
        newAssignment.key = newKey;

        this.setState({
            keyAssignments: [...this.state.keyAssignments, newAssignment],
        });
    }
}
