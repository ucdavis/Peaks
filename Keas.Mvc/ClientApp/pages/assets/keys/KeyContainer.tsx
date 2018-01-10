import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson } from "../../../Types";
import KeyList from "./KeyList";

interface IState {
  loading: boolean;
  keys: IKey[];
}

export default class KeyContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      keys: [],
      loading: true
    };
  }
  public async componentDidMount() {
    const keys = await this.context.fetch(`/keys/list/${this.context.team.id}`);
    this.setState({ keys, loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Keys</h4>
          <KeyList keys={this.state.keys} />
        </div>
      </div>
    );
  }
}
