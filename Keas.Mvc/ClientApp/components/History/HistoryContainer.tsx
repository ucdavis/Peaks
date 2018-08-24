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
  controller: string;
  id: number;
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
      reloaded: false, // controls checkmark to show that histories have been refreshed
      reloading: false, // controls loading icon while fetching
    };
  }
  public async componentDidMount() {
    this.setState({loading: true});
    const histories = await this._getHistories();
    this.setState({ histories, loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    return (
      <div className="card history-color">
        <div>
          <div className="card-head"><h2><i className="fas fa-history fa-xs"/> History</h2></div>
        </div>
        <div className="card-content">
          {this.state.histories.length > 0 &&
            <HistoryList histories={this.state.histories} />}
          {this.state.histories.length < 1 &&
            <p>No histories were found</p>
          }
          {this.props.controller === "people" &&
            <Button color="link" onClick={this._reloadHistories} disabled={this.state.reloading}>
              Refresh {" "}
              {this.state.reloaded ? <i className="fas fa-check" /> : null}
              {this.state.reloading ? <i className="fas fa-spin fa-spinner" /> : null}
            </Button> }
        </div>
      </div>
    );
  }

  private _reloadHistories = async () => {
    this.setState({reloading: true, reloaded: false});
    const histories = await this._getHistories();
    this.setState({ histories, reloading: false, reloaded: true });
  }

  private _getHistories = async () => {
    const historyFetchUrl = `/api/${this.context.team.name}/${this.props.controller}/getHistory/${this.props.id}`;

    const histories = await this.context.fetch(historyFetchUrl);
    return histories;
  }

}
