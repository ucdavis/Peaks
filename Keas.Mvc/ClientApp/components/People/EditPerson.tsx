import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson, personSchema } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { validateEmail } from '../../util/email';
import PersonEditValues from './PersonEditValues';

interface IProps {
  onEdit: (person: IPerson) => void;
  selectedPerson: IPerson;
  tags: string[];
}

interface IState {
  error: IValidationError;
  modal: boolean;
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class EditPerson extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      error: {
        message: '',
        path: ''
      },
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
                  error={this.state.error}
                />
              </form>
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
    const error = yupAssetValidation(personSchema, this.state.person, {
      context: { validateEmail }
    });
    this.setState({ error, validState: error.message === '' });
  };
}
