import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { IWorkstation, workstationSchema } from '../../models/Workstations';
import WorkstationAssignmentValues from './WorkstationAssignmentValues';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  onEdit: (workstation: IWorkstation) => void;
  closeModal: () => void;
  openUpdateModal: (workstation: IWorkstation) => void;
  tags: string[];
  modal: boolean;
  selectedWorkstation: IWorkstation;
}

const EditWorkstation = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);
  const [workstation, setWorkstation] = useState<IWorkstation>(
    props.selectedWorkstation
  );

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(workstationSchema, workstation);
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [workstation]);

  if (!workstation) {
    return null;
  }

  const changeProperty = (property: string, value: string) => {
    setWorkstation({ ...workstation, [property]: value });
  };

  // clear everything out on close
  const confirmClose = () => {
    if (!window.confirm('Please confirm you want to close!')) {
      return;
    }

    closeModal();
  };

  const closeModal = () => {
    setError({
      message: '',
      path: ''
    });
    setSubmitting(false);
    setValidState(false);
    setWorkstation(null);
    props.closeModal();
  };

  // assign the selected key even if we have to create it
  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await props.onEdit(workstation);
    } catch (err) {
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
      className='spaces-color'
    >
      <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
        <h2 className="text-xl font-semibold">Edit Workstation</h2>
        <Button color='link' onClick={closeModal}>
          <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
        </Button>
      </div>
      <ModalBody className='p-6'>
        <div className='container-fluid'>
          <form>
            <WorkstationEditValues
              selectedWorkstation={workstation}
              changeProperty={changeProperty}
              disableEditing={false}
              tags={props.tags}
              disableSpaceEditing={true}
              error={error}
            />
          </form>
          <WorkstationAssignmentValues
            selectedWorkstation={props.selectedWorkstation}
            openUpdateModal={props.openUpdateModal}
          />
        </div>
      </ModalBody>
      <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
        <Button
          color='asset'
          onClick={editSelected}
          disabled={!validState || submitting}
        >
          Go! {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};

export default EditWorkstation;
