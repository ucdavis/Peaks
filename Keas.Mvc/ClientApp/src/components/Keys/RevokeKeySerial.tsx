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
        scrollable={true}
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            Revoke for {selectedKeySerial.key.code} {selectedKeySerial.number}
          </h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
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
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => revokeKeySerial()}
            disabled={!isValidToRevoke() || submitting}
          >
            Revoke {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeKeySerial;
