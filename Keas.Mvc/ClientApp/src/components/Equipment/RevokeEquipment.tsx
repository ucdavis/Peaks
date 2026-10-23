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
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Revoke {props.selectedEquipment.name}</h2>
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
          <EquipmentAssignmentValues
            selectedEquipment={props.selectedEquipment}
            openUpdateModal={props.openUpdateModal}
          />
          {!isValidToRevoke() && (
            <div>The equipment you have chosen does not have an assignment</div>
          )}
        </ModalBody>
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button
            color='error'
            onClick={() => revokeEquipment()}
            disabled={!isValidToRevoke() || submitting}
          >
            Revoke {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeEquipment;
