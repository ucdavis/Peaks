import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import { IEquipment, IEquipmentAttribute, ISpace } from '../../Types';
import EquipmentAssignmentValues from './EquipmentAssignmentValues';
import EquipmentEditValues from './EquipmentEditValues';

interface IProps {
  onEdit: (equipment: IEquipment) => void;
  modal: boolean;
  closeModal: () => void;
  openUpdateModal: (equipment: IEquipment) => void;
  commonAttributeKeys: string[];
  equipmentTypes: string[];
  selectedEquipment: IEquipment;
  space: ISpace;
  tags: string[];
}

interface IState {
  error: string;
  equipment: IEquipment;
  submitting: boolean;
  validState: boolean;
}

export default class EditEquipment extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      equipment: this.props.selectedEquipment
        ? {
            ...this.props.selectedEquipment,
            attributes: [...this.props.selectedEquipment.attributes]
          }
        : null,
      error: '',
      submitting: false,
      validState: false
    };
  }

  public render() {
    if (!this.state.equipment) {
      return null;
    }
    return (
      <Modal
        isOpen={this.props.modal}
        toggle={this._confirmClose}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Edit Equipment</h2>
          <Button color='link' onClick={this._closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <EquipmentEditValues
              selectedEquipment={this.state.equipment}
              changeProperty={this._changeProperty}
              disableEditing={false}
              updateAttributes={this._updateAttributes}
              commonAttributeKeys={this.props.commonAttributeKeys}
              equipmentTypes={this.props.equipmentTypes}
              tags={this.props.tags}
              space={this.props.space}
            />
            <EquipmentAssignmentValues
              selectedEquipment={this.props.selectedEquipment}
              openUpdateModal={this.props.openUpdateModal}
            />
            {this.state.error && (
              <span className='color-unitrans'>{this.state.error}</span>
            )}{' '}
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
          </Button>{' '}
        </ModalFooter>
      </Modal>
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

  // clear everything out on close
  private _confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    this._closeModal();
  };

  private _closeModal = () => {
    this.setState({
      equipment: null,
      error: '',
      submitting: false,
      validState: false
    });
    this.props.closeModal();
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

  // assign the selected key even if we have to create it
  private _editSelected = async () => {
    if (!this.state.validState || this.state.submitting) {
      return;
    }
    this.setState({ submitting: true });
    this.state.equipment.attributes = this.state.equipment.attributes.filter(
      x => !!x.key
    );
    try {
      await this.props.onEdit(this.state.equipment);
    } catch (e) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    let error = '';
    let valid = true;
    if (!this.state.equipment) {
      valid = false;
    } else if (this.state.equipment.name.trim() === '') {
      error = 'You must give this equipment a name.';
      valid = false;
    } else if (this.state.equipment.name.length > 64) {
      error = 'The equipment name you have entered is too long.';
      valid = false;
    } else if (
      this.state.equipment.serialNumber &&
      this.state.equipment.serialNumber.length > 64
    ) {
      error = 'The serial number you have entered is too long.';
      valid = false;
    } else if (
      this.state.equipment.make &&
      this.state.equipment.make.length > 64
    ) {
      error = 'The make you have entered is too long.';
      valid = false;
    } else if (
      this.state.equipment.model &&
      this.state.equipment.model.length > 64
    ) {
      error = 'The model you have entered is too long.';
      valid = false;
    } else if (
      this.state.equipment.systemManagementId &&
      this.state.equipment.systemManagementId.length > 16
    ) {
      error = 'The bigfix id you have entered is too long.';
      valid = false;
    } else if (
      this.state.equipment.attributes.some(x => x.value && x.value.length > 64)
    ) {
      error = 'One of the attribute values you entered is too long.';
      valid = false;
    }
    this.setState({ error, validState: valid });
  };
}
