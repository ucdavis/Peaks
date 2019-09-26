import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { AppContext, IPerson } from '../../Types';
import { validateEmail } from '../../util/email';
import PersonEditValues from './PersonEditValues';

interface IProps {
  onEdit: (person: IPerson) => void;
  selectedPerson: IPerson;
  tags: string[];
}

interface IState {
  error: string;
  modal: boolean;
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class EditPerson extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      modal: false,
      person: this.props.selectedPerson,
      submitting: false,
      validState: false
    };
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPerson.id !== this.props.selectedPerson.id) {
      this.setState({ person: nextProps.selectedPerson });
    }
  }

  public render() {
    if (!this.state.person) {
      return null;
    }
    return (
      <div>
        <Button className='btn btn-link' onClick={this._toggleModal}>
          <i className='fas fa-edit fa-sm fa-fw mr-2' aria-hidden='true' />
          Edit Person
        </Button>
        <Modal
          isOpen={this.state.modal}
          toggle={this._confirmClose}
          size='lg'
          className='people-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Edit Person</h2>
            <Button color='link' onClick={this._closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>
          <ModalBody>
            <div className='container-fluid'>
              <form>
                <PersonEditValues
                  selectedPerson={this.state.person}
                  changeProperty={this._changeProperty}
                  changeSupervisor={this._changeSupervisor}
                  disableEditing={false}
                  tags={this.props.tags}
                />
              </form>
              {this.state.error}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={this._editSelected}
              disabled={!this.state.validState || this.state.submitting}
            >
              Go!{' '}
              {this.state.submitting && (
                <i className='fas fa-circle-notch fa-spin' />
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _changeProperty = (property: string, value: any) => {
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
      error: '',
      modal: false,
      submitting: false,
      validState: false
    });
  };

  private _toggleModal = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  // assign the selected key even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.onEdit(this.state.person);
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    let valid = true;
    let error = '';
    if (!this.state.person) {
      valid = false;
    } else if (!this.state.person.firstName || !this.state.person.lastName) {
      valid = false;
      error = 'You must give this person a name';
    } else if (
      this.state.person.firstName.length > 50 ||
      this.state.person.lastName.length > 50
    ) {
      valid = false;
      error = 'The name you have chosen is too long';
    } else if (!this.state.person.email) {
      valid = false;
      error = 'You must give this person an email address';
    } else if (!validateEmail(this.state.person.email)) {
      valid = false;
      error = 'You must use a valid email address';
    }
    this.setState({ validState: valid, error });
  };
}
