import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
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
        size='lg'
        className='equipment-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Delete {props.selectedEquipment.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>

        <ModalBody className='p-6'>
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
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button
            color='error'
            onClick={deleteEquipment}
            disabled={submitting}
          >
            Go! {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteEquipment;
