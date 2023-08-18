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
  deleteEquipment: (equipment: IEquipment) => void;
  selectedEquipment: IEquipment;
}

const DeleteEquipment = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedEquipment) {
    return null;
  }

  const deleteEquipment = async () => {
    if (
      props.selectedEquipment.assignment !== null &&
      !confirm(
        'This equipment is currently assigned, are you sure you want to delete it?'
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await props.deleteEquipment(props.selectedEquipment);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    props.closeModal();
  };

  return (
    <div>
      <Modal
        isOpen={props.modal}
        toggle={props.closeModal}
        size='lg'
        className='equipment-color'
        scrollable={true}
      >
        <div className='modal-header row justify-content-between'>
          <h2>Delete {props.selectedEquipment.name}</h2>
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
          {props.selectedEquipment.assignment && (
            <EquipmentAssignmentValues
              selectedEquipment={props.selectedEquipment}
              openUpdateModal={props.openUpdateModal}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={deleteEquipment}
            disabled={submitting}
          >
            Go! {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteEquipment;
