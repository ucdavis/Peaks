import { Modal, ModalBody, ModalFooter } from '../Shared/AppModal';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import {
  equipmentSchema,
  IEquipment,
  IEquipmentAttribute
} from '../../models/Equipment';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
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

const EditEquipment = (props: IProps) => {
  const [equipment, setEquipment] = useState<IEquipment>(
    props.selectedEquipment
      ? {
          ...props.selectedEquipment,
          attributes: [...props.selectedEquipment.attributes]
        }
      : null
  );
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidtState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(equipmentSchema, equipment);
      setError(error);
      setValidtState(error.message === '');
    };

    validateState();
  }, [equipment]);

  if (!equipment) {
    return null;
  }

  const changeProperty = (property: string, value: string) => {
    setEquipment({ ...equipment, [property]: value });
  };

  // clear everything out on close
  const confirmClose = () => {
    if (!window.confirm('Please confirm you want to close!')) {
      return;
    }

    closeModal();
  };

  const closeModal = () => {
    setEquipment(null);
    setError({
      message: '',
      path: ''
    });
    setSubmitting(false);
    setValidtState(false);
    props.closeModal();
  };

  const updateAttributes = (attributes: IEquipmentAttribute[]) => {
    setEquipment({ ...equipment, attributes: attributes });
  };

  // assign the selected key even if we have to create it
  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }
    setSubmitting(true);
    const equipmentData = equipment;
    equipmentData.attributes = equipmentData.attributes.filter(x => !!x.key);
    try {
      await props.onEdit(equipmentData);
    } catch (e) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  return (
    <Modal
      isOpen={props.modal}
      toggle={confirmClose}
      className='equipment-color equipment-edit-modal'
      labelledBy='equipment-edit-title'
    >
      <div className='flex items-start justify-between gap-4 border-b border-main-border p-5 sm:px-8 sm:py-6'>
        <div className='min-w-0'>
          <p className='mb-1 text-sm text-base-content/60'>Edit equipment</p>
          <h2 id='equipment-edit-title' className='break-words text-2xl font-semibold'>{props.selectedEquipment.name}</h2>
        </div>
        <button type='button' className='btn btn-ghost btn-square btn-sm shrink-0'
          aria-label='Close equipment editor' onClick={confirmClose} disabled={submitting}>
          <XMarkIcon className='size-5' aria-hidden='true' />
        </button>
      </div>
      <ModalBody>
          <EquipmentEditValues
            spacious
            selectedEquipment={equipment}
            changeProperty={changeProperty}
            disableEditing={false}
            updateAttributes={updateAttributes}
            commonAttributeKeys={props.commonAttributeKeys}
            equipmentTypes={props.equipmentTypes}
            tags={props.tags}
            space={props.space}
            error={error}
          />
          <EquipmentAssignmentValues
            spacious
            selectedEquipment={props.selectedEquipment}
            openUpdateModal={props.openUpdateModal}
          />
      </ModalBody>
      <ModalFooter showCancel={false}>
        <button type='button' className='btn btn-ghost' onClick={confirmClose} disabled={submitting}>Cancel</button>
        <Button
          color='asset'
          onClick={editSelected}
          disabled={!validState || submitting}
        >
          {submitting ? 'Saving…' : 'Save changes'} {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};

export default EditEquipment;
