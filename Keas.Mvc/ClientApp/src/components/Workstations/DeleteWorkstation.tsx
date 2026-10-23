import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IWorkstation } from '../../models/Workstations';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  deleteWorkstation: (workstation: IWorkstation) => void;
  selectedWorkstation: IWorkstation;
}

const DeleteWorkstation = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedWorkstation) {
    return null;
  }

  const deleteWorkstation = async () => {
    if (
      props.selectedWorkstation.assignment !== null &&
      !window.confirm(
        'This workstation is currently assigned, are you sure you want to delete it?'
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await props.deleteWorkstation(props.selectedWorkstation);
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
        className='workstation-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Delete {props.selectedWorkstation.name}</h2>
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
            onClick={deleteWorkstation}
            disabled={submitting}
          >
            Go! {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteWorkstation;
