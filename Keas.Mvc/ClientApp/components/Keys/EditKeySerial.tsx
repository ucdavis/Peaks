import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IKeySerial, keySerialSchema } from '../../models/KeySerials';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import KeySerialAssignmentValues from './KeySerialAssignmentValues';
import KeySerialEditValues from './KeySerialEditValues';

interface IProps {
  selectedKeySerial: IKeySerial;
  statusList: string[];
  isModalOpen: boolean;
  onEdit: (keySerial: IKeySerial) => void;
  openUpdateModal: (keySerial: IKeySerial) => void;
  closeModal: () => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
  checkIfKeySerialNumberIsValid: (
    keyId: number,
    serialNumber: string,
    id: number
  ) => boolean;
}

const EditKeySerial = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [keySerial, setKeySerial] = useState<IKeySerial>(
    props.selectedKeySerial
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      const checkIfKeySerialNumberIsValid = props.checkIfKeySerialNumberIsValid;
      const error = yupAssetValidation(keySerialSchema, keySerial, {
        context: { checkIfKeySerialNumberIsValid }
      });
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [keySerial, props.checkIfKeySerialNumberIsValid]);

  if (!keySerial) {
    return null;
  }

  const changeProperty = (property: string, value: string) => {
    setKeySerial({ ...keySerial, [property]: value });
  };

  // clear everything out on close
  const confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    closeModal();
  };

  const closeModal = () => {
    setError({ message: '', path: '' });
    setKeySerial(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  // assign the selected key even if we have to create it
  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await props.onEdit(keySerial);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  return (
    <Modal
      isOpen={props.isModalOpen}
      toggle={confirmClose}
      size='lg'
      className='keys-color'
    >
      <div className='modal-header row justify-content-between'>
        <h2>
          Edit Serial {props.selectedKeySerial.key.code}{' '}
          {props.selectedKeySerial.number}
        </h2>
        <Button color='link' onClick={closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>
        <div className='container-fluid'>
          <form>
            <KeySerialEditValues
              keySerial={keySerial}
              changeProperty={changeProperty}
              disableEditing={false}
              statusList={props.statusList}
              goToKeyDetails={props.goToKeyDetails}
              error={error}
            />

            <KeySerialAssignmentValues
              selectedKeySerial={props.selectedKeySerial}
              openUpdateModal={props.openUpdateModal}
            />
          </form>
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

export default EditKeySerial;
