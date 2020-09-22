import { addYears, format, isBefore, startOfDay } from 'date-fns';
import * as React from 'react';
import DatePicker from 'react-date-picker';
import {
  Button,
  Form,
  FormFeedback,
  Modal,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { Context } from '../../Context';
import { IKey, IKeyInfo } from '../../models/Keys';
import { IKeySerial, keySerialSchema } from '../../models/KeySerials';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AssignPerson from '../People/AssignPerson';
import AssignDate from '../Shared/AssignDate';
import KeySerialEditValues from './KeySerialEditValues';
import SearchKeys from './SearchKeys';
import SearchKeySerial from './SearchKeySerials';

interface IProps {
  person?: IPerson;
  selectedKey: IKey;
  selectedKeySerial: IKeySerial;
  statusList: string[];
  isModalOpen: boolean;
  onCreate: (person: IPerson, keySerial: IKeySerial, date: any) => void;
  onOpenModal: () => void;
  closeModal: () => void;
  openEditModal: (keySerial: IKeySerial) => void;
  openDetailsModal: (keySerial: IKeySerial) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
  checkIfKeySerialNumberIsValid: (keyId: number, serialNumber: string, id: number) => boolean;
}

interface IState {
  date: Date;
  error: IValidationError;
  keySerial: IKeySerial;
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class AssignKey extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props: IProps) {
    super(props);

    const assignment =
      props.selectedKeySerial && props.selectedKeySerial.keySerialAssignment;

    const date = !!assignment
      ? new Date(assignment.expiresAt)
      : addYears(startOfDay(new Date()), 3);

    const person = !!assignment ? assignment.person : props.person;

    this.state = {
      date,
      error: { message: '', path: '' },
      keySerial: props.selectedKeySerial,
      person,
      submitting: false,
      validState: false
    };
  }

  public render() {
    const { isModalOpen, selectedKey } = this.props;
    const { person, keySerial } = this.state;

    return (
      <Modal
        isOpen={isModalOpen}
        toggle={this._confirmClose}
        size='lg'
        className='keys-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            {this.props.selectedKeySerial || this.props.person
              ? 'Assign Key Serial'
              : 'Add Key Serial'}
          </h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <Form>
              <AssignPerson
                disabled={
                  !!this.props.person ||
                  (!!this.props.selectedKeySerial &&
                    !!this.props.selectedKeySerial.keySerialAssignment)
                }
                isRequired={keySerial && keySerial.id !== 0 && !person}
                // disable if we are on person page or updating
                label='Assign Person'
                person={person}
                onSelect={this._onSelectPerson}
                error={this.state.error}
              />

              {(!!person || !!this.props.person) && (
                <AssignDate
                  date={this.state.date}
                  isRequired={true}
                  error={this.state.error}
                  onChangeDate={this._changeDate}
                />
              )}
              {!this.state.keySerial && (
                <div className='form-group'>
                  <SearchKeySerial
                    selectedKey={selectedKey}
                    selectedKeySerial={keySerial}
                    onSelect={this._onSelected}
                    onDeselect={this._onDeselected}
                    openDetailsModal={this.props.openDetailsModal}
                  />
                </div>
              )}
              {this.state.keySerial &&
              !this.state.keySerial.id && ( // if we are creating a new serial, edit properties
                  <div>
                    <div className='row justify-content-between'>
                      <h3>Create New Serial</h3>
                      <Button
                        color='link'
                        onClick={this._onDeselected}
                      >
                        Clear{' '}
                        <i className='fas fa-times fa-sm' aria-hidden='true' />
                      </Button>
                    </div>
                    {!this.state.keySerial.key && (
                      <div>
                        <label>Choose a key to create a new serial for</label>
                        <SearchKeys
                          onSelect={this._selectKey}
                          onDeselect={this._deselectKey}
                          allowNew={false}
                        />
                      </div>
                    )}
                    {!!this.state.keySerial.key && (
                      <KeySerialEditValues
                        keySerial={this.state.keySerial}
                        changeProperty={this._changeProperty}
                        disableEditing={false}
                        statusList={this.props.statusList}
                        goToKeyDetails={this.props.goToKeyDetails}
                        error={this.state.error}
                      />
                    )}
                  </div>
                )}
              {this.state.keySerial && !!this.state.keySerial.id && (
                <div>
                  <div className='row justify-content-between'>
                    <h3>Assign Existing Serial</h3>
                    <Button
                      color='link'
                      onClick={this._onDeselected}
                    >
                      Clear{' '}
                      <i className='fas fa-times fa-sm' aria-hidden='true' />
                    </Button>
                  </div>

                  <KeySerialEditValues
                    keySerial={this.state.keySerial}
                    disableEditing={true}
                    openEditModal={this.props.openEditModal}
                    statusList={this.props.statusList}
                    goToKeyDetails={this.props.goToKeyDetails}
                  />
                </div>
              )}
            </Form>
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

  private _changeProperty = (property: string, value: string) => {
    this.setState(
      prevState => ({
        keySerial: {
          ...prevState.keySerial,
          [property]: value
        }
      }),
      this._validateState
    );
  };

  private _selectKey = (keyInfo: IKeyInfo) => {
    this.setState(prevState => ({
      keySerial: {
        ...prevState.keySerial,
        key: keyInfo.key
      }
    }));
  };

  private _deselectKey = () => {
    this.setState(prevState => ({
      keySerial: {
        ...prevState.keySerial,
        key: null
      }
    }));
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
      error: { message: '', path: '' },
      keySerial: null,
      person: null,
      submitting: false,
      validState: false
    });

    this.props.closeModal();
  };

  // assign the selected key even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    const person = this.props.person ? this.props.person : this.state.person;

    try {
      await this.props.onCreate(
        person,
        this.state.keySerial,
        format(this.state.date, 'MM/dd/yyyy')
      );
    } catch (err) {
      this.setState({ submitting: false });
      return;
    }

    this._closeModal();
  };

  private _onSelected = (keySerial: IKeySerial) => {
    this.setState(
      { keySerial, error: { message: '', path: '' } },
      this._validateState
    );
  };

  private _onDeselected = () => {
    this.setState({ keySerial: null, error: { message: '', path: '' } });
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _changeDate = (newDate: Date) => {
    this.setState(
      { date: startOfDay(new Date(newDate)), error: { message: '', path: '' } },
      this._validateState
    );
  };

  private _validateState = () => {
    // for if they select person before key serial, don't show error but disable button
    if (!this.state.keySerial) {
      this.setState({ validState: false });
      return;
    }

    const checkIfKeySerialNumberIsValid = this.props
      .checkIfKeySerialNumberIsValid;
    const error = yupAssetValidation(
      keySerialSchema,
      this.state.keySerial,
      {
        context: { checkIfKeySerialNumberIsValid }
      },
      { date: this.state.date, person: this.state.person }
    );
    this.setState({ error, validState: error.message === '' });
  };
}
