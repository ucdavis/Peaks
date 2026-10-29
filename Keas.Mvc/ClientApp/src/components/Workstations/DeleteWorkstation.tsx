import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button } from 'reactstrap';
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
        className='workstation-color'
      >
        <ModalHeading>Delete {props.selectedWorkstation.name}</ModalHeading>

        <ModalBody>
          <WorkstationEditValues
            selectedWorkstation={props.selectedWorkstation}
            disableEditing={true}
            disableSpaceEditing={true}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color='error'
            onClick={deleteWorkstation}
            disabled={submitting}
          >
            Delete {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteWorkstation;
