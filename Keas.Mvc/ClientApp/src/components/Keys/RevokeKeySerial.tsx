import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';
import KeySerialAssignmentValues from './KeySerialAssignmentValues';
import KeySerialEditValues from './KeySerialEditValues';

interface IProps {
  selectedKeySerial: IKeySerial;
  isModalOpen: boolean;
  closeModal: () => void;
  openEditModal: (keySerial: IKeySerial) => void;
  openUpdateModal: (keySerial: IKeySerial) => void;
  onRevoke: (keySerial: IKeySerial) => void;
  updateSelectedKeySerial: (keySerial: IKeySerial) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
}

const RevokeKeySerial = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { selectedKeySerial } = props;

  if (!selectedKeySerial) {
    return null;
  }

  const revokeKeySerial = async () => {
    if (!isValidToRevoke()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.onRevoke(props.selectedKeySerial);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    props.closeModal();
  };

  const isValidToRevoke = () => {
    return (
      !!props.selectedKeySerial && !!props.selectedKeySerial.keySerialAssignment
    );
  };

  return (
    <div>
      <Modal
        isOpen={props.isModalOpen}
        toggle={props.closeModal}
        size='lg'
        className='keys-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">
            Revoke for {selectedKeySerial.key.code} {selectedKeySerial.number}
          </h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>
        <ModalBody className='p-6'>
          <KeySerialEditValues
            keySerial={selectedKeySerial}
            disableEditing={true}
            openEditModal={props.openEditModal}
            goToKeyDetails={props.goToKeyDetails}
          />
          <KeySerialAssignmentValues
            selectedKeySerial={selectedKeySerial}
            openUpdateModal={props.openUpdateModal}
          />
        </ModalBody>
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button
            color='error'
            onClick={() => revokeKeySerial()}
            disabled={!isValidToRevoke() || submitting}
          >
            Revoke {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeKeySerial;
