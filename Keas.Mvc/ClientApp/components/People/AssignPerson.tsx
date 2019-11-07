import * as React from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, FormFeedback, FormGroup, Label } from 'reactstrap';
import { Context } from '../../Context';
import { IValidationError } from '../../models/Shared';
import { IPerson } from '../../Types';

interface IProps {
  onSelect: (person: IPerson) => void;
  person?: IPerson;
  label: string;
  disabled: boolean;
  isRequired: boolean;
  error?: IValidationError;
}

interface IState {
  modal: boolean;
  isSearchLoading: boolean;
  people: IPerson[];
}

// TODO: need a way to clear out selected person
// Assign a person via search lookup, unless a person is already provided
export default class AssignPerson extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      isSearchLoading: false,
      modal: false,
      people: []
    };
  }

  public render() {
    return this._renderFindPerson();
  }

  private _renderFindPerson = () => {
    const isInvalid =
      (this.props.isRequired && !this.props.person) ||
      (this.props.error && this.props.error.path === 'person');
    // call onSelect when a user is found
    return (
      <div>
        <FormGroup>
          <Label for='searchPeople'>{this.props.label}</Label>
          <AsyncTypeahead
            id='searchPeople' // for accessibility
            inputProps={{
              className: isInvalid ? 'form-control is-invalid' : ''
            }}
            isInvalid={isInvalid}
            disabled={this.props.disabled}
            isLoading={this.state.isSearchLoading}
            minLength={3}
            defaultSelected={this.props.person ? [this.props.person] : []}
            placeholder='Search for person by name or email'
            labelKey={(option: IPerson) => `${option.name} (${option.email})`}
            filterBy={() => true} // don't filter on top of our search
            renderMenuItemChildren={(option, props, index) => (
              <div>
                <div>
                  <Highlighter key='name' search={props.text}>
                    {option.name}
                  </Highlighter>
                </div>
                <div>
                  <Highlighter key='email' search={props.text}>
                    {option.email}
                  </Highlighter>
                </div>
              </div>
            )}
            onSearch={this._onSearch}
            onChange={selected => {
              if (selected && selected.length === 1) {
                this.props.onSelect(selected[0]);
              }
              if (selected && selected.length === 0) {
                this.props.onSelect(null);
              }
            }}
            options={this.state.people}
          />
          {this.props.error && this.props.error.path === 'person' && (
            <div className='invalid-feedback d-block'>
              {this.props.error.message}
            </div>
          )}
        </FormGroup>
        <div>
          <Link to={`/${this.context.team.slug}/people/create`} target='_blank'>
            <Button color='link' type='button'>
              <i className='fas fa-search fas-sm' aria-hidden='true' /> Can't
              find who you're looking for?
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  private _onSearch = async (query: string) => {
    this.setState({ isSearchLoading: true });
    let people: IPerson[] = null;
    try {
      people = await this.context.fetch(
        `/api/${this.context.team.slug}/people/searchPeople?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching people.');
      this.setState({ isSearchLoading: false });
      return;
    }
    this.setState({
      isSearchLoading: false,
      people
    });
  };
}
