import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IHistory, IPerson } from "../../Types";

import HistoryList from "./HistoryList";

interface IState {
  loading: boolean;
  histories: IHistory[];
}

interface IProps {
  person?: IPerson;
  type?: string;
  id?: number;
}

export default class HistoryContainer extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      histories: [],
      loading: true
    };
  }
  public async componentDidMount() {
    // are we getting the person's key or the team's?
    const historyFetchUrl = this.props.person
      ? `/api/${this.context.team.name}/people/getHistory/${this.props.person.id}`
      : `/api/${this.context.team.name}/${this.props.type}/getHistory/${this.props.id}`;

    const histories = await this.context.fetch(historyFetchUrl);
    this.setState({ histories, loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">History</h4>
          {this.state.histories.length > 0 && 
            <HistoryList histories={this.state.histories} />}
          {this.state.histories.length < 1 &&
            <p>No histories were found</p>
          }
        </div>
      </div>
    );
  }

}
