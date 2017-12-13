import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";

import AssignAccess from "./AssignAccess";
import AccessList from "./AccessList";

interface IState {
    loading: boolean;
    accessAssignments: IAccessAssignment[];
    accessList: IAccess[];
}

export default class AccessContainer extends React.Component<{}, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            accessAssignments: [],
            accessList: [],
            loading: true,
        };
    }
    public async componentDidMount() {
        const accessAssignments = await this.context.fetch(
            `/access/listassigned/${this.context.person.id}`,
        );
        const accessList: IAccess[] = await this.context.fetch(
            `/access/listteamaccess?teamId=${this.context.person.teamId}`,
        );
        this.setState({ accessAssignments,  accessList, loading: false });
    }

    public render() {
        if (this.state.loading) {
            return <h2>Loading...</h2>;
        }
        return (
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">Access</h4>
                    <AccessList accessAssignments={this.state.accessAssignments} onRevoke={this._revokeAccess} />
                    <AssignAccess accessList={this.state.accessList} onCreate={this._createAndAssignAccess} onAssign={this._assignAccess} />
                </div>
            </div>
        );
    }

    public _createAndAssignAccess = async (access: IAccess) => {
        // call API to create an access, then assign it

        // TODO: basically all fake, make it real
        const newAccess: IAccess = await this.context.fetch("/access/create", {
            body: JSON.stringify(access),
            method: "POST",
        });

        const assignUrl = `/access/assign?accessId=${newAccess.id}&personId=${
            this.context.person.id
            }`;
        const newAssignment: IAccessAssignment = await this.context.fetch(
            assignUrl,
            { method: "POST" },
        );
        newAssignment.access = newAccess;

        this.setState({
            accessList: [...this.state.accessList, newAccess],
            accessAssignments: [...this.state.accessAssignments, newAssignment],
        });
    }

    public _assignAccess = async (access: IAccess) => {
        const assignUrl = `/access/assign?accessId=${access.id}&personId=${
            this.context.person.id
            }`;
        const newAssignment: IAccessAssignment = await this.context.fetch(
            assignUrl,
            { method: "POST" },
        );
        newAssignment.access = access;

        this.setState({
            accessAssignments: [...this.state.accessAssignments, newAssignment],
        });
    }

    public _revokeAccess = async (accessAssignment: IAccessAssignment) => {

        //remove from state
        const index = this.state.accessAssignments.indexOf(accessAssignment);
        if (index > -1) {
            const shallowCopy = [...this.state.accessAssignments];
            shallowCopy.splice(index, 1);
            this.setState({ accessAssignments: shallowCopy });
        }

        // call API to actually revoke

        const newAccess: IAccess = await this.context.fetch("/access/revoke", {
            body: JSON.stringify(accessAssignment),
            method: "POST",
        });

    }
}
