import PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { AppContext, IKey, IPerson } from "../../Types";

interface IProps {
  onSelect: (person: IPerson) => void;
}

interface IState {
  modal: boolean;
}

// Assign a person via search lookup, unless a person is already provided
export default class AssignPerson extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
  }

  public render() {
    if (this.context.person) {
      return this._renderExistingPerson();
    } else {
      return this._renderFindPerson();
    }
  }

  private _renderFindPerson = () => {
    // call onSelect when a user is found
    return (
      <input
        type="text"
        id="assignto"
        className="form-control"
        placeholder="Search by email"
      />
    );
  };

  private _renderExistingPerson = () => {
    return (
      <input
        type="text"
        id="assignto"
        className="form-control"
        value={this.context.person.user.name}
        disabled={true}
      />
    );
  };
}
