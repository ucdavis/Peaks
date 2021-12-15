import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IWorkstation } from '../../models/Workstations';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  revokeWorkstation: (workstation: IWorkstation) => void;
  selectedWorkstation: IWorkstation;
}

const RevokeWorkstation = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedWorkstation || !props.selectedWorkstation.assignment) {
    return null;
  }

  const revokeWorkstation = async () => {
    if (!props.selectedWorkstation) {
      return null;
    }
    setSubmitting(true);
    try {
      await props.revokeWorkstation(props.selectedWorkstation);
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
        className='spaces-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Revoke {props.selectedWorkstation.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <WorkstationEditValues
            selectedWorkstation={props.selectedWorkstation}
            disableEditing={true}
            disableSpaceEditing={true}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={revokeWorkstation}
            disabled={submitting}
          >
            Revoke
          </Button>
        </ModalFooter>
      </Modal>{' '}
    </div>
  );
};

export default RevokeWorkstation;
