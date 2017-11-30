import * as React from "react";
import PropTypes from "prop-types";

import { IPerson, IKeyAssignment, AppContext } from "../../Types";

import AssignKey from "./AssignKey";
import KeyList from "./KeyList";

interface IProps {
  person: IPerson;
}

interface IState {
  loading: boolean;
  keyAssignments: [IKeyAssignment];
}

export default class KeyContainer extends React.Component<IProps, IState> {
  static contextTypes = {
    fetch: PropTypes.func
  };
  context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      keyAssignments: [] as [IKeyAssignment]
    };
  }
  async componentDidMount() {
    const keyAssignments = await this.context.fetch("/keys/listassigned/1");
    this.setState({ keyAssignments, loading: false });
  }
  public render() {
    if (this.state.loading) return <h2>Loading...</h2>;
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Keys</h4>
          <AssignKey />
          <KeyList keyAssignments={this.state.keyAssignments} />
        </div>
      </div>
    );
  }
}
