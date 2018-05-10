import PropTypes from "prop-types";
import * as React from "react";
import { Button } from "reactstrap";

import { AppContext, IHistory, IPerson } from "../../Types";

import HistoryList from "./HistoryList";

interface IState {
  histories: IHistory[];
  loading: boolean;
  reloaded: boolean;
  reloading: boolean;
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
      loading: true,
      reloaded: false,
      reloading: false,
    };
  }
  public async componentDidMount() {
      this.setState({loading: true});
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
          {!!this.props.person &&
            <Button onClick={this._loadHistories} disabled={this.state.reloading}>
              Reload Histories {" "}
              {this.state.reloaded ? <i className="fa fa-check" /> : null}
              {this.state.reloading ? <i className="fa fa-spin fa-circle-o-notch" /> : null}
            </Button> }
        </div>
      </div>
    );
  }

  private _loadHistories = async () => {
        this.setState({reloading: true, reloaded: false});
        const historyFetchUrl = this.props.person
        ? `/api/${this.context.team.name}/people/getHistory/${this.props.person.id}`
        : `/api/${this.context.team.name}/${this.props.type}/getHistory/${this.props.id}`;
  
      const histories = await this.context.fetch(historyFetchUrl);
      this.setState({ histories, reloading: false, reloaded: true });
  }

}
