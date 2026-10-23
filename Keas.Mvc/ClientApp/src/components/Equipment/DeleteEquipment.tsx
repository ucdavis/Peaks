import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useState } from 'react';
import { Button } from 'reactstrap';
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
      !window.confirm(
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
        className='equipment-color'
      >
        <ModalHeading>Delete {props.selectedEquipment.name}</ModalHeading>

        <ModalBody>
          <EquipmentEditValues
            spacious
            selectedEquipment={props.selectedEquipment}
            disableEditing={true}
            openEditModal={props.openEditModal}
          />
          {props.selectedEquipment.assignment && (
            <EquipmentAssignmentValues
            spacious
              selectedEquipment={props.selectedEquipment}
              openUpdateModal={props.openUpdateModal}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='error'
            onClick={deleteEquipment}
            disabled={submitting}
          >
            Delete {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteEquipment;
