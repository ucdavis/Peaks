import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess, IAccessAssignment, IPerson } from "../../Types";

import AssignAccess from "./AssignAccess";
import AccessList from "./AccessList";

interface IState {
  loading: boolean;
  accessAssignments: IAccessAssignment[];
}

export default class AccessContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      accessAssignments: [],
      loading: true
    };
  }
  public async componentDidMount() {
    const accessAssignments = await this.context.fetch(
      `/access/listassigned/${this.context.person.id}`
    );
    this.setState({ accessAssignments, loading: false });
  }

  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Access</h4>
          <AccessList
            accessAssignments={this.state.accessAssignments}
            onRevoke={this._revokeAccess}
          />
          <AssignAccess onAssign={this._assignAccess} />
        </div>
      </div>
    );
  }

  public _assignAccess = async (access: IAccess): Promise<IAccessAssignment> => {
    if (access.id === 0) {
      // if we need to create the new access first
      access.teamId = this.context.person.teamId; // assign to current team

      access = await this.context.fetch("/access/create", {
        body: JSON.stringify(access),
        method: "POST"
      });
    }

    // now assign the existing or newly created access
    const assignUrl = `/access/assign?accessId=${access.id}&personId=${
      this.context.person.id
    }`;
    const newAssignment: IAccessAssignment = await this.context.fetch(
      assignUrl,
      { method: "POST" }
    );
    newAssignment.access = access;

    this.setState({
      accessAssignments: [...this.state.accessAssignments, newAssignment]
    });

    return newAssignment;
  };

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
      method: "POST"
    });
  };
}
