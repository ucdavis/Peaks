import { XMarkIcon } from '@heroicons/react/24/outline';
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
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Revoke {props.selectedWorkstation.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>
        <ModalBody className='p-6'>
          <WorkstationEditValues
            selectedWorkstation={props.selectedWorkstation}
            disableEditing={true}
            disableSpaceEditing={true}
          />
        </ModalBody>
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button
            color='error'
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
