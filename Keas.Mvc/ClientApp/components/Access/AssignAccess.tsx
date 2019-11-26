import { addYears, format, isBefore, startOfDay } from 'date-fns';
import * as React from 'react';
import DatePicker from 'react-date-picker';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { accessSchema, IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AssignPerson from '../People/AssignPerson';
import { AssignDate } from '../Shared/AssignDate';
import AccessAssignmentCard from './AccessAssignmentCard';
import AccessAssignmentTable from './AccessAssignmentTable';
import AccessEditValues from './AccessEditValues';
import SearchAccess from './SearchAccess';

interface IProps {
  closeModal: () => void;
  modal: boolean;
  onCreate: (access: IAccess, date: any, person: IPerson) => Promise<void>;
  person?: IPerson;
  selectedAccess?: IAccess;
  tags: string[];
}

interface IState {
  access?: IAccess;
  date: Date;
  error: IValidationError;
  person?: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class AssignAccess extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      access: this.props.selectedAccess,
      date: addYears(startOfDay(new Date()), 3),
      error: {
        message: '',
        path: ''
      },
      submitting: false,
      validState: false
    };
  }

  public render() {
    return (
      <Modal
        isOpen={this.props.modal}
        toggle={this._confirmClose}
        size='lg'
        className='access-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            {this.props.selectedAccess || this.props.person
              ? 'Assign Access'
              : 'Add Access'}
          </h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <form>
              <div className='form-group'>
                <AssignPerson
                  disabled={!!this.props.person}
                  person={this.props.person || this.state.person}
                  onSelect={this._onSelectPerson}
                  label='Assign To'
                  isRequired={
                    this.state.access && this.state.access.teamId !== 0
                  }
                  error={this.state.error}
                />
              </div>
              {(!!this.state.person || !!this.props.person) && (
                <AssignDate
                  date={this.state.date}
                  isRequired={true}
                  error={this.state.error}
                  onChangeDate={this._changeDate}
                />
              )}
              {!this.state.access && (
                <div className='form-group'>
                  <SearchAccess
                    onSelect={this._onSelected}
                    onDeselect={this._onDeselected}
                  />
                </div>
              )}
              {!!this.state.access &&
              !this.state.access.teamId && ( // if we are creating a new access, edit properties
                  <div>
                    <div className='row justify-content-between'>
                      <h3>Create New Access</h3>
                      <Button
                        className='btn btn-link'
                        onClick={this._onDeselected}
                      >
                        Clear{' '}
                        <i className='fas fa-times fa-sm' aria-hidden='true' />
                      </Button>
                    </div>
                    <AccessEditValues
                      selectedAccess={this.state.access}
                      disableEditing={false}
                      onAccessUpdate={access =>
                        this.setState({ access }, this._validateState)
                      }
                      tags={this.props.tags}
                    />
                  </div>
                )}
              {!!this.state.access && !!this.state.access.teamId && (
                <div>
                  <div className='row justify-content-between'>
                    <h3>Assign Exisiting Access</h3>
                    <Button
                      className='btn btn-link'
                      onClick={this._onDeselected}
                    >
                      Clear{' '}
                      <i className='fas fa-times fa-sm' aria-hidden='true' />
                    </Button>
                  </div>
                  <AccessEditValues
                    selectedAccess={this.state.access}
                    disableEditing={true}
                    tags={this.props.tags}
                  >
                    <AccessAssignmentCard disableEditing={true}>
                      <AccessAssignmentTable
                        assignments={this.state.access.assignments}
                      />
                    </AccessAssignmentCard>
                  </AccessEditValues>
                </div>
              )}
            </form>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={this._assignSelected}
            disabled={!this.state.validState || this.state.submitting}
          >
            Go!{' '}
            {this.state.submitting && (
              <i className='fas fa-circle-notch fa-spin' />
            )}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }

  // clear everything out on close
  private _confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    this._closeModal();
  };

  private _closeModal = () => {
    this.setState({
      access: null,
      date: addYears(startOfDay(new Date()), 3),
      error: {
        message: '',
        path: ''
      },
      person: null,
      submitting: false,
      validState: false
    });
    this.props.closeModal();
  };

  // assign the selected access even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    const person = this.props.person ? this.props.person : this.state.person;

    try {
      await this.props.onCreate(
        this.state.access,
        format(this.state.date, 'MM/dd/yyyy'),
        person
      );
    } finally {
      this.setState({ submitting: false });
    }

    this._closeModal();
  };

  // once we have either selected or created the access we care about
  private _onSelected = (access: IAccess) => {
    this.setState(
      {
        access
      },
      this._validateState
    );
  };

  private _onDeselected = () => {
    this.setState(
      {
        access: null,
        error: {
          message: '',
          path: ''
        }
      },
      this._validateState
    );
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _validateState = () => {
    const checkValidAssignmentToPerson = this._checkValidAssignmentToPerson;
    const personId = this.props.person
      ? this.props.person.id
      : this.state.person.id;
    const error = yupAssetValidation(
      accessSchema,
      this.state.access,
      {
        context: { checkValidAssignmentToPerson, personId }
      },
      { date: this.state.date, person: this.state.person }
    );
    // duplicate assignments are checked on access.assignments
    // but we want it to show up under the person input
    if (error.path === 'assignments') {
      error.path = 'person';
    }
    this.setState({ error, validState: error.message === '' });
  };

  private _checkValidAssignmentToPerson = (
    assignments: IAccessAssignment[],
    personId: number
  ) => {
    let valid = true;
    for (const a of assignments) {
      if (a.personId === personId) {
        valid = false;
        break;
      }
    }
    return valid;
  };

  private _changeDate = (newDate: Date) => {
    this.setState({ date: startOfDay(new Date(newDate)) }, this._validateState);
  };
}
