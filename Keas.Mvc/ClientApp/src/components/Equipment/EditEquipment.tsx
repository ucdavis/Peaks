import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
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
    if (!confirm('Please confirm you want to close!')) {
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
      size='lg'
      className='equipment-color'
      scrollable={true}
    >
      <div className='modal-header row justify-content-between'>
        <h2>Edit Equipment</h2>
        <Button color='link' onClick={closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>
        <div className='container-fluid'>
          <EquipmentEditValues
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
            selectedEquipment={props.selectedEquipment}
            openUpdateModal={props.openUpdateModal}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          onClick={editSelected}
          disabled={!validState || submitting}
        >
          Go! {submitting && <i className='fas fa-circle-notch fa-spin' />}
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};

export default EditEquipment;
