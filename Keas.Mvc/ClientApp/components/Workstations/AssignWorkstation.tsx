import { addYears, format, isBefore, startOfDay } from 'date-fns';
import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import { IWorkstation, workstationSchema } from '../../models/Workstations';
import AssignPerson from '../People/AssignPerson';
import { AssignDate } from '../Shared/AssignDate';
import SearchWorkstations from './SearchWorkstations';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  onCreate: (person: IPerson, workstation: IWorkstation, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  closeModal: () => void;
  openDetailsModal: (workstation: IWorkstation) => void;
  openEditModal: (workstation: IWorkstation) => void;
  selectedWorkstation: IWorkstation;
  person?: IPerson;
  space?: ISpace;
  tags: string[];
}

interface IState {
  date: Date;
  workstation: IWorkstation;
  error: IValidationError;
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class AssignWorkstation extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);

    this.state = {
      date:
        !!this.props.selectedWorkstation &&
        !!this.props.selectedWorkstation.assignment
          ? new Date(this.props.selectedWorkstation.assignment.expiresAt)
          : addYears(startOfDay(new Date()), 3),
      error: {
        message: '',
        path: ''
      },
      person:
        !!this.props.selectedWorkstation &&
        !!this.props.selectedWorkstation.assignment
          ? this.props.selectedWorkstation.assignment.person
          : this.props.person,
      submitting: false,
      validState: false,
      workstation: this.props.selectedWorkstation
    };
  }

  public render() {
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this._confirmClose}
          size='lg'
          className='spaces-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>
              {this.props.selectedWorkstation || this.props.person
                ? 'Assign Workstation'
                : 'Add Workstation'}
            </h2>
            <Button color='link' onClick={this._closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>

          <ModalBody>
            <div className='container-fluid'>
              <form>
                <AssignPerson
                  disabled={
                    !!this.props.person ||
                    (!!this.props.selectedWorkstation &&
                      !!this.props.selectedWorkstation.assignment)
                  } // disable if we are on person page or updating
                  person={this.props.person || this.state.person}
                  label='Assign To'
                  onSelect={this._onSelectPerson}
                  isRequired={
                    this.state.workstation &&
                    this.state.workstation.teamId !== 0
                  }
                  error={this.state.error}
                />
                {(!!this.state.person || !!this.props.person) && (
                  <AssignDate
                    date={this.state.date}
                    isRequired={true}
                    error={this.state.error}
                    onChangeDate={this._changeDate}
                  />
                )}
                {!this.state.workstation && (
                  <div className='form-group'>
                    <SearchWorkstations
                      selectedWorkstation={this.state.workstation}
                      onSelect={this._onSelected}
                      onDeselect={this._onDeselected}
                      space={this.props.space}
                      openDetailsModal={this.props.openDetailsModal}
                    />
                  </div>
                )}
                {this.state.workstation &&
                !this.state.workstation.teamId && ( // if we are creating a new workstation, edit properties
                    <div>
                      <div className='row justify-content-between'>
                        <h3>Create New Workstation</h3>
                        <Button
                          className='btn btn-link'
                          onClick={this._onDeselected}
                        >
                          Clear{' '}
                          <i
                            className='fas fa-times fa-sm'
                            aria-hidden='true'
                          />
                        </Button>
                      </div>
                      <WorkstationEditValues
                        tags={this.props.tags}
                        selectedWorkstation={this.state.workstation}
                        changeProperty={this._changeProperty}
                        disableEditing={false}
                        disableSpaceEditing={false}
                      />
                    </div>
                  )}
                {!!this.state.workstation && !!this.state.workstation.teamId && (
                  <div>
                    <div className='row justify-content-between'>
                      <h3>Assign Existing Workstation</h3>
                      <Button
                        className='btn btn-link'
                        onClick={this._onDeselected}
                      >
                        Clear{' '}
                        <i className='fas fa-times fa-sm' aria-hidden='true' />
                      </Button>
                    </div>
                    <WorkstationEditValues
                      selectedWorkstation={this.state.workstation}
                      disableEditing={true}
                      openEditModal={this.props.openEditModal}
                      disableSpaceEditing={true}
                    />
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
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState(
      prevState => ({
        workstation: {
          ...prevState.workstation,
          [property]: value
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
      date: addYears(startOfDay(new Date()), 3),
      error: {
        message: '',
        path: ''
      },
      person: null,
      submitting: false,
      validState: false,
      workstation: null
    });
    this.props.closeModal();
  };

  // assign the selected workstation even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    const person = this.props.person ? this.props.person : this.state.person;
    const workstation = this.state.workstation;

    try {
      await this.props.onCreate(
        person,
        workstation,
        format(this.state.date, 'MM/dd/yyyy')
      );
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  // once we have either selected or created the workstation we care about
  private _onSelected = (workstation: IWorkstation) => {
    this.setState({ workstation }, this._validateState);
  };

  private _onDeselected = () => {
    this.setState(
      {
        error: {
          message: '',
          path: ''
        },
        workstation: null
      },
      this._validateState
    );
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _validateState = () => {
    const error = yupAssetValidation(
      workstationSchema,
      this.state.workstation,
      {}, // no context
      { date: this.state.date, person: this.state.person }
    );
    this.setState({ error, validState: error.message === '' });
  };

  private _changeDate = (newDate: Date) => {
    this.setState({ date: startOfDay(new Date(newDate)) }, this._validateState);
  };
}
