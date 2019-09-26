import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { AppContext, IPerson, IUser } from '../../Types';
import PersonEditValues from './PersonEditValues';
import SearchUsers from './SearchUsers';

interface IProps {
  onCreate: (person: IPerson) => void;
  modal: boolean;
  tags: string[];
  userIds: string[];
  onAddNew: () => void;
  closeModal: () => void;
}

interface IState {
  moreInfoString: string; // for errors and for explaining results, e.g. if person is new or inactive
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class CreatePerson extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      moreInfoString: '',
      person: null,
      submitting: false,
      validState: false
    };
  }

  public render() {
    return (
      <div>
        <Button color='link' onClick={this.props.onAddNew}>
          <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Person
        </Button>
        <Modal
          isOpen={this.props.modal}
          toggle={this._confirmClose}
          size='lg'
          className='people-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Add Person</h2>
            <Button color='link' onClick={this._closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>
          <ModalBody>
            <div className='container-fluid'>
              <div className='form-group'>
                <SearchUsers updatePerson={this._onSelectPerson} />
              </div>

              <div className='form-group'>
                <PersonEditValues
                  selectedPerson={this.state.person}
                  changeProperty={this._changeProperty}
                  changeSupervisor={this._changeSupervisor}
                  disableEditing={false}
                  tags={this.props.tags}
                />
              </div>

              {this.state.moreInfoString}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={this._createSelected}
              disabled={!this.state.validState || this.state.submitting}
            >
              Add{' '}
              {this.state.submitting && (
                <i className='fas fa-circle-notch fa-spin' />
              )}
            </Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState(
      {
        person: {
          ...this.state.person,
          [property]: value
        }
      },
      this._validateState
    );
  };

  private _changeSupervisor = (supervisor: IPerson) => {
    this.setState(
      {
        person: {
          ...this.state.person,
          supervisor,
          supervisorId: supervisor !== null ? supervisor.id : null
        }
      },
      this._validateState
    );
  };

  // clear everything out on close
  private _confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    this._closeModal();
  };

  private _closeModal = () => {
    this.setState({
      moreInfoString: '',
      person: null,
      submitting: false,
      validState: false
    });
    this.props.closeModal();
  };

  private _createSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.onCreate(this.state.person);
    } catch (err) {
      this.setState({
        submitting: false
      });
      return;
    }
    this._closeModal();
  };

  // once we have selected a user from SearchUser
  private _onSelectPerson = (person: IPerson) => {
    if (person === null) {
      // if there was a 404, person will be null
      // on other errors, SearchUsers will make a toast
      this.setState(
        {
          moreInfoString:
            'The user could not be found. Please make sure you are searching the correct kerberos or email.',
          person: null
        },
        this._validateState
      );
    } else if (
      this.props.userIds.findIndex(x => x === person.userId) !== -1 ||
      (person.active && person.teamId !== 0)
    ) {
      this.setState(
        {
          moreInfoString:
            'The user you have chosen is already active in this team.',
          person: null
        },
        this._validateState
      );
    } else if (person.active && person.teamId === 0) {
      this.setState(
        {
          moreInfoString: 'You are creating a new person.',
          person
        },
        this._validateState
      );
    } else {
      this.setState(
        {
          moreInfoString:
            'This person was set to inactive. Continuing will set them to active.',
          person
        },
        this._validateState
      );
    }
  };

  private _validateState = () => {
    let valid = true;
    if (!this.state.person) {
      valid = false;
    } else if (
      !this.state.person.firstName ||
      !this.state.person.lastName ||
      !this.state.person.email
    ) {
      valid = false;
    }
    this.setState({ validState: valid });
  };
}
