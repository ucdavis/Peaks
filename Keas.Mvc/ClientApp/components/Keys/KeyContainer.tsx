import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson } from "../../Types";

import AssignKey from "./AssignKey";
import KeyList from "./KeyList";

interface IState {
  loading: boolean;
  keys: IKey[];
}

export default class KeyContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
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
    const keyFetchUrl = this.context.person
      ? `/keys/listassigned/${this.context.person.id}`
      : `/keys/list/${this.context.team.id}`;

    const keys = await this.context.fetch(keyFetchUrl);
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
          <AssignKey onCreate={this._createAndAssignKey} />
          <KeyList keys={this.state.keys} />
        </div>
      </div>
    );
  }
  public _createAndAssignKey = async (key: IKey) => {
    // call API to create a key, then assign it

    // TODO: basically all fake, make it real
    const newKey: IKey = await this.context.fetch("/keys/create", {
      body: JSON.stringify(key),
      method: "POST"
    });

    const assignUrl = `/keys/assign?keyId=${newKey.id}&personId=${
      this.context.person.id
    }`;

    const assignedKey: IKey = await this.context.fetch(assignUrl, {
      method: "POST"
    });

    this.setState({
      keys: [...this.state.keys, assignedKey]
    });
  };
}
