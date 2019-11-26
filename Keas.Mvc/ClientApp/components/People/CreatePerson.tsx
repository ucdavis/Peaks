import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson, personSchema } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { validateEmail } from '../../util/email';
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
  error: IValidationError;
  moreInfoString: string; // for explaining results, e.g. if person is new or inactive
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class CreatePerson extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      error: {
        message: '',
        path: ''
      },
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
                  error={this.state.error}
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
      prevState => ({
        person: {
          ...prevState.person,
          [property]: value
        }
      }),
      this._validateState
    );
  };

  private _changeSupervisor = (supervisor: IPerson) => {
    this.setState(
      prevState => ({
        person: {
          ...prevState.person,
          supervisor,
          supervisorId: supervisor !== null ? supervisor.id : null
        }
      }),
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
      error: {
        message: '',
        path: ''
      },
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
    const error = yupAssetValidation(personSchema, this.state.person, {
      context: { validateEmail }
    });
    this.setState({ error, validState: error.message === '' });
  };
}
