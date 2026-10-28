import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
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
        className='equipment-color'
      >
        <ModalHeading>Revoke {props.selectedEquipment.name}</ModalHeading>

        <ModalBody>
          <EquipmentEditValues
            spacious
            selectedEquipment={props.selectedEquipment}
            disableEditing={true}
            openEditModal={props.openEditModal}
          />
          <EquipmentAssignmentValues
            spacious
            selectedEquipment={props.selectedEquipment}
            openUpdateModal={props.openUpdateModal}
          />
          {!isValidToRevoke() && (
            <div>The equipment you have chosen does not have an assignment</div>
          )}
        </ModalBody>
        <ModalFooter>
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
