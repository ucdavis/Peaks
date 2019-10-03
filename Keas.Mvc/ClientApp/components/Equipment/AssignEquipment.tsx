import { addYears, format, isBefore, startOfDay } from 'date-fns';
import * as React from 'react';
import DatePicker from 'react-date-picker';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IEquipment, IEquipmentAttribute, IPerson, ISpace } from '../../Types';
import AssignPerson from '../People/AssignPerson';
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
  error: string;
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
      error: '',
      person:
        !!this.props.selectedEquipment &&
        !!this.props.selectedEquipment.assignment
          ? this.props.selectedEquipment.assignment.person
          : this.props.person,
      submitting: false,
      validState: false
    };
  }

  // make sure we change the equipment we are updating if the parent changes selected equipment
  public componentWillReceiveProps(nextProps) {
    if (nextProps.selectedEquipment !== this.props.selectedEquipment) {
      this.setState({ equipment: nextProps.selectedEquipment });
    }

    if (nextProps.person !== this.state.person) {
      this.setState({ person: nextProps.person });
    }
    if (
      !!nextProps.selectedEquipment &&
      !!nextProps.selectedEquipment.assignment
    ) {
      this.setState({
        date: new Date(nextProps.selectedEquipment.assignment.expiresAt),
        person: nextProps.selectedEquipment.assignment.person
      });
    }
  }

  public render() {
    return (
      <div>
        <Button color='link' onClick={this.props.onAddNew}>
          <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Equipment
        </Button>
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
              <form>
                <div className='form-group'>
                  <label htmlFor='assignto'>Assign To</label>
                  <AssignPerson
                    person={this.state.person}
                    onSelect={this._onSelectPerson}
                    isRequired={
                      this.state.equipment && this.state.equipment.teamId !== 0
                    }
                    disabled={
                      !!this.props.person ||
                      (!!this.props.selectedEquipment &&
                        !!this.props.selectedEquipment.assignment)
                    } // disable if we are on person page or updating
                  />
                </div>
                {(!!this.state.person || !!this.props.person) && (
                  <div className='form-group'>
                    <label>Set the expiration date</label>
                    <br />
                    <DatePicker
                      format='MM/dd/yyyy'
                      required={true}
                      clearIcon={null}
                      value={this.state.date}
                      onChange={this._changeDate}
                    />
                  </div>
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

                      <EquipmentEditValues
                        selectedEquipment={this.state.equipment}
                        commonAttributeKeys={this.props.commonAttributeKeys}
                        changeProperty={this._changeProperty}
                        disableEditing={false}
                        updateAttributes={this._updateAttributes}
                        space={this.props.space}
                        tags={this.props.tags}
                        equipmentTypes={this.props.equipmentTypes}
                      />
                    </div>
                  )}
                {this.state.equipment && !!this.state.equipment.teamId && (
                  <div>
                    <div className='row justify-content-between'>
                      <h3>Assign Existing Equipment</h3>
                      <Button
                        className='btn btn-link'
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
                    />
                  </div>
                )}
                {this.state.error}
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
      </div>
    );
  }

  private _changeProperty = (property: string, value: string) => {
    this.setState(
      {
        equipment: {
          ...this.state.equipment,
          [property]: value
        }
      },
      this._validateState
    );
  };

  private _updateAttributes = (attributes: IEquipmentAttribute[]) => {
    this.setState(
      {
        equipment: {
          ...this.state.equipment,
          attributes
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
      date: addYears(startOfDay(new Date()), 3),
      equipment: null,
      error: '',
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
    // if this equipment is not already assigned

    // TODO: more validation of name
    if (equipment.name.length > 64) {
      this.setState(
        {
          equipment: null,
          error: 'The equipment name you have chosen is too long'
        },
        this._validateState
      );
    } else {
      this.setState({ equipment, error: '' }, this._validateState);
    }
  };

  private _onDeselected = () => {
    this.setState({ equipment: null, error: '' }, this._validateState);
  };

  private _onSelectPerson = (person: IPerson) => {
    this.setState({ person }, this._validateState);
  };

  private _validateState = () => {
    let valid = true;
    if (!this.state.equipment || this.state.equipment.name === '') {
      valid = false;
    } else if (
      this.state.equipment.teamId !== 0 &&
      !this.state.person &&
      !this.props.person
    ) {
      // if not a new equipment, require a person
      valid = false;
    } else if (this.state.error !== '') {
      valid = false;
    } else if (!this.state.date) {
      valid = false;
    } else if (!isBefore(new Date(), new Date(this.state.date))) {
      valid = false;
    }
    this.setState({ validState: valid });
  };

  private _changeDate = (newDate: Date) => {
    this.setState(
      { date: startOfDay(new Date(newDate)), error: '' },
      this._validateState
    );
  };
}
