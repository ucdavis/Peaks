import * as React from "react";
import "isomorphic-fetch";

import { IPerson } from "../../Types";

import KeyList from "./KeyList";

interface IProps {
  person: IPerson;
}

interface IState {
  loading: boolean;
  data: any;
}

export default class KeyContainer extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: {}
    };
  }
  async componentDidMount() {
    // fetch the keys associated with this user
    // TODO: for now load from SWAPI
    // fetch("https://swapi.co/api/films/2/")
    //   .then(r => r.json())
    //   .then(data => this.setState({ data, loading: false }))
    //   .catch(console.log);

    const data = await this.doFetch(fetch("/keys/listassigned/1"));
    this.setState({ data, loading: false });
  }
  public render() {
    if (this.state.loading) return <h2>Loading...</h2>;

    return <KeyList />;
  }

  doFetch = async (p: Promise<Response>) => {
    const t = await p;
    if (!t.ok) throw new Error(); 

    const d = await t.json();
    return d;
  };
}
