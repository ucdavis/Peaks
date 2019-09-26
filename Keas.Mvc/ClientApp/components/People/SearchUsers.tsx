import * as PropTypes from 'prop-types';
import * as React from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label
} from 'reactstrap';
import { AppContext, IPerson } from '../../Types';

interface IState {
  isInvalid: boolean;
  loading: boolean;
  search: string;
}

interface IProps {
  updatePerson: (person: IPerson) => void;
}

export default class SearchUsers extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      isInvalid: false,
      loading: false, // controls loading icon while fetching
      search: ''
    };
  }

  public render() {
    return (
      <FormGroup>
        <Label for='search'>Search For User Using Kerberos or Email</Label>
        <InputGroup>
          <Input
            type='search'
            name='search'
            id='userSearch'
            placeholder='Search . . .'
            className='form-control'
            value={this.state.search}
            invalid={this.state.isInvalid}
            onChange={e => this.setState({ search: e.target.value })}
            onKeyPress={e => this._handleKeyPress(e)}
          />
          <InputGroupAddon addonType='append'>
            <Button className='btn btn-link' onClick={this._loadUser}>
              {this.state.loading ? (
                <i className='fas fa-spin fa-spinner' />
              ) : (
                <i className='fas fa-search fa-sm' />
              )}
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    );
  }

  private _handleKeyPress = e => {
    if (e.which === 13) {
      this._loadUser();
    }
  };

  private _loadUser = async () => {
    if (this.state.loading || this.state.search === '') {
      return;
    }
    this.setState({ loading: true });
    const userFetchUrl = `/api/${this.context.team.slug}/people/searchUsers?searchTerm=${this.state.search}`;

    let person = null;
    try {
      person = await this.context.fetch(userFetchUrl);
    } catch (err) {
      if (err.message === 'Not Found') {
        // on 404
        person = null;
      } else {
        // on some other error
        toast.error('Error searching users.');
        this.setState({ loading: false });
        return;
      }
    }
    this.props.updatePerson(person);
    this.setState({ loading: false, isInvalid: !person });
  };
}
