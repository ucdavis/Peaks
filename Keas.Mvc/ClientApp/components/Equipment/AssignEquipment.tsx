import { addYears, format, startOfDay } from 'date-fns';
import * as React from 'react';
import { Button, Form, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import {
  equipmentSchema,
  IEquipment,
  IEquipmentAttribute
} from '../../models/Equipment';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import AssignPerson from '../People/AssignPerson';
import { AssignDate } from '../Shared/AssignDate';
import EquipmentEditValues from './EquipmentEditValues';
import SearchEquipment from './SearchEquipment';

interface IProps {
  onCreate: (person: IPerson, equipment: IEquipment, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  openDetailsModal: (equipment: IEquipment) => void;
  openEditModal: (equipment: IEquipment) => void;
  closeModal: () => void;
  selectedEquipment: IEquipment;
  person?: IPerson;
  space: ISpace;
  tags: string[];
  commonAttributeKeys: string[];
  equipmentTypes: string[];
}

interface IState {
  date: Date;
  equipment: IEquipment;
  error: IValidationError;
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

export default class AssignEquipment extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      date:
        !!this.props.selectedEquipment &&
        !!this.props.selectedEquipment.assignment
          ? new Date(this.props.selectedEquipment.assignment.expiresAt)
          : addYears(startOfDay(new Date()), 3),
      equipment: this.props.selectedEquipment,
      error: {
        message: '',
        path: ''
      },
      person:
        !!this.props.selectedEquipment &&
        !!this.props.selectedEquipment.assignment
          ? this.props.selectedEquipment.assignment.person
          : this.props.person,
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
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            {this.props.selectedEquipment || this.props.person
              ? 'Assign Equipment'
              : 'Add Equipment'}
          </h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <Form>
              <AssignPerson
                person={this.state.person}
                label='Assign To'
                onSelect={this._onSelectPerson}
                isRequired={
                  this.state.equipment && this.state.equipment.teamId !== 0
                }
                disabled={
                  !!this.props.person ||
                  (!!this.props.selectedEquipment &&
                    !!this.props.selectedEquipment.assignment)
                } // disable if we are on person page or updating
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
              {!this.state.equipment && (
                <div className='form-group'>
                  <SearchEquipment
                    selectedEquipment={this.state.equipment}
                    onSelect={this._onSelected}
                    onDeselect={this._onDeselected}
                    space={this.props.space}
                    openDetailsModal={this.props.openDetailsModal}
                  />
                </div>
              )}
              {this.state.equipment &&
              !this.state.equipment.teamId && ( // if we are creating a new equipment, edit properties
                  <div>
                    <div className='row justify-content-between'>
                      <h3>Create New Equipment</h3>
                      <Button
                        color='link'
                        onClick={this._onDeselected}
                      >
                        Clear{' '}
                        <i className='fas fa-times fa-sm' aria-hidden='true' />
                      </Button>
                    </div>

                    <EquipmentEditValues
                      selectedEquipment={this.state.equipment}
                      commonAttributeKeys={this.props.commonAttributeKeys}
                      changeProperty={this._changeProperty}
                      disableEditing={false}
                      updateAttributes={this._updateAttributes}
                      space={this.props.space}
                      tags={this.props.tags}
                      equipmentTypes={this.props.equipmentTypes}
                      error={this.state.error}
                    />
                  </div>
                )}
              {this.state.equipment && !!this.state.equipment.teamId && (
                <div>
                  <div className='row justify-content-between'>
                    <h3>Assign Existing Equipment</h3>
                    <Button
                      color='link'
                      onClick={this._onDeselected}
                    >
                      Clear{' '}
                      <i className='fas fa-times fa-sm' aria-hidden='true' />
                    </Button>
                  </div>

                  <EquipmentEditValues
                    selectedEquipment={this.state.equipment}
                    commonAttributeKeys={this.props.commonAttributeKeys}
                    disableEditing={true}
                    openEditModal={this.props.openEditModal}
                    tags={this.props.tags}
                    error={this.state.error}
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
        equipment: {
          ...prevState.equipment,
          [property]: value
        }
      }),
      this._validateState
    );
  };

  private _updateAttributes = (attributes: IEquipmentAttribute[]) => {
    this.setState(
      prevState => ({
        equipment: {
          ...prevState.equipment,
          attributes
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
      equipment: null,
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

  // assign the selected equipment even if we have to create it
  private _assignSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });
    const person = this.props.person ? this.props.person : this.state.person;
    const equipment = this.state.equipment;
    equipment.attributes = equipment.attributes.filter(x => !!x.key);
    try {
      await this.props.onCreate(
        person,
        equipment,
        format(this.state.date, 'MM/dd/yyyy')
      );
    } catch (e) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  // once we have either selected or created the equipment we care about
  private _onSelected = (equipment: IEquipment) => {
    this.setState({ equipment }, this._validateState);
  };

  private _onDeselected = () => {
    this.setState(
      {
        equipment: null,
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
    const error = yupAssetValidation(
      equipmentSchema,
      this.state.equipment,
      {}, // no context
      { date: this.state.date, person: this.state.person }
    );
    this.setState({ error, validState: error.message === '' });
  };

  private _changeDate = (newDate: Date) => {
    this.setState(
      {
        date: startOfDay(new Date(newDate)),
        error: {
          message: '',
          path: ''
        }
      },
      this._validateState
    );
  };
}
