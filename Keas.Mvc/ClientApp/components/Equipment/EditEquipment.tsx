import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Context } from '../../Context';
import {
  equipmentSchema,
  IEquipment,
  IEquipmentAttribute
} from '../../models/Equipment';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { ISpace } from '../../Types';
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
  error: IValidationError;
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
      error: {
        message: '',
        path: ''
      },
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
              error={this.state.error}
            />
            <EquipmentAssignmentValues
              selectedEquipment={this.props.selectedEquipment}
              openUpdateModal={this.props.openUpdateModal}
            />
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
      error: {
        message: '',
        path: ''
      },
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
    const equipment = this.state.equipment;
    equipment.attributes = equipment.attributes.filter(x => !!x.key);
    try {
      await this.props.onEdit(equipment);
    } catch (e) {
      this.setState({ submitting: false });
      return;
    }
    this._closeModal();
  };

  private _validateState = () => {
    const error = yupAssetValidation(equipmentSchema, this.state.equipment);
    this.setState({ error, validState: error.message === '' });
  };
}
