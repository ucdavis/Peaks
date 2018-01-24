import PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { AppContext, IKey, IPerson } from "../../Types";

interface IProps {
  onSelect: (person: IPerson) => void;
}

interface IState {
  modal: boolean;
  isSearchLoading: boolean;
  people: IPerson[];
}

// TODO: need a way to clear out selected person and maybe lock in choice
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
      isSearchLoading: false,
      modal: false,
      people: []
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
      <div>
        <AsyncTypeahead
          isLoading={this.state.isSearchLoading}
          labelKey={(option: IPerson) =>
            `${option.user.name} (${option.user.email})`
          }
          onSearch={async query => {
            this.setState({ isSearchLoading: true });
            const people = await this.context.fetch(
              `/${this.context.team.name}/people/search?q=${query}`
            );
            this.setState({
              isSearchLoading: false,
              people
            });
          }}
          onChange={selected => {
            if (selected && selected.length === 1) {
              this.props.onSelect(selected[0]);
            }
          }}
          options={this.state.people}
        />
      </div>
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
