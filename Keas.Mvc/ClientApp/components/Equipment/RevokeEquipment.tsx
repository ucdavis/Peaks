import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import EquipmentAssignmentValues from './EquipmentAssignmentValues';
import EquipmentEditValues from './EquipmentEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  openEditModal: (equipment: IEquipment) => void;
  openUpdateModal: (equipment: IEquipment) => void;
  revokeEquipment: (equipment: IEquipment) => void;
  selectedEquipment: IEquipment;
}

const RevokeEquipment = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedEquipment || !props.selectedEquipment.assignment) {
    return null;
  }
  const revokeEquipment = async () => {
    if (!isValidToRevoke()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.revokeEquipment(props.selectedEquipment);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    props.closeModal();
  };

  const isValidToRevoke = () => {
    return props.selectedEquipment.assignment !== null;
  };
  return (
    <div>
      <Modal
        isOpen={props.modal}
        toggle={props.closeModal}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Revoke {props.selectedEquipment.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <EquipmentEditValues
            selectedEquipment={props.selectedEquipment}
            disableEditing={true}
            openEditModal={props.openEditModal}
          />
          <EquipmentAssignmentValues
            selectedEquipment={props.selectedEquipment}
            openUpdateModal={props.openUpdateModal}
          />
          {!isValidToRevoke() && (
            <div>The equipment you have chosen does not have an assignment</div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => revokeEquipment()}
            disabled={!isValidToRevoke() || submitting}
          >
            Revoke {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeEquipment;
