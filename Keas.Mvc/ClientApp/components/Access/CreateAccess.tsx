import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";

interface IProps {
  onSelect: (access: IAccess) => void;
}

interface IState {
  name: string;
}

// Search for existing access then send selection back to parent
export default class CreateAccess extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      name: ""
    };
  }

  // create and return new access object
  _onSelect = () => {
    this.props.onSelect({
      id: 0,
      teamId: 0,
      name: this.state.name
    });
  };

  public render() {
    return (
      <div>
        <form>
          <div className="form-group">
            <label htmlFor="example" />
            <input
              type="text"
              className="form-control"
              placeholder="Access Name"
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
            />
            <small className="form-text text-muted">
              Enter the name you'll use to refer to this type of access
            </small>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this._onSelect}
          >
            Next
          </button>
        </form>
      </div>
    );
  }
}
