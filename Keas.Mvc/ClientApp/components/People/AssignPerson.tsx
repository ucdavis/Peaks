import * as PropTypes from 'prop-types';
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { AppContext, IKey, IPerson } from "../../Types";

interface IProps {
  onSelect: (person: IPerson) => void;
  person?: IPerson;
}

interface IState {
  modal: boolean;
  isSearchLoading: boolean;
  people: IPerson[];
}

// TODO: need a way to clear out selected person
// Assign a person via search lookup, unless a person is already provided
export default class AssignPerson extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      isSearchLoading: false,
      modal: false,
      people: [],
    };
  }

  public render() {
    if (this.props.person) {
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
          minLength={3}
          placeholder="Search for person by name or email"
          labelKey={(option: IPerson) =>
            `${option.name} (${option.email})`
          }
          filterBy={() => true} // don't filter on top of our search
          renderMenuItemChildren={(option, props, index) => (
              <div>
                  <div>
                      <Highlighter key="name" search={props.text}>
                          {option.name}
                      </Highlighter>
                  </div>
                  <div>
                        <Highlighter key="email" search={props.text}>{option.email}</Highlighter>
                  </div>
              </div>
          )}
          onSearch={async query => {
            this.setState({ isSearchLoading: true });
            const people = await this.context.fetch(
              `/api/${this.context.team.slug}/people/search?q=${query}`
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
        value={this.props.person.name}
        disabled={true}
      />
    );
  };
}
