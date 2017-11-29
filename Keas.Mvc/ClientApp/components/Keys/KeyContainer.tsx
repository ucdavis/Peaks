import * as React from "react";
import "isomorphic-fetch";

import { IPerson, IKeyAssignment } from "../../Types";

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
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      keyAssignments: [] as [IKeyAssignment]
    };
  }
  async componentDidMount() {
    // fetch the keys associated with this user
    // TODO: for now load from SWAPI
    // fetch("https://swapi.co/api/films/2/")
    //   .then(r => r.json())
    //   .then(data => this.setState({ data, loading: false }))
    //   .catch(console.log);

    const keyAssignments = await this.doFetch(fetch("/keys/listassigned/1"));
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

  doFetch = async (p: Promise<Response>) => {
    const t = await p;
    if (!t.ok) throw new Error();

    const d = await t.json();
    return d;
  };
}
