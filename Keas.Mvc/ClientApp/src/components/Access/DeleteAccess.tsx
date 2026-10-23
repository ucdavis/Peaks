import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IAccess } from '../../models/Access';
import AccessEditValues from './AccessEditValues';

interface IProps {
  modal: boolean;
  selectedAccess: IAccess;
  closeModal: () => void;
  deleteAccess: (access: IAccess) => void;
}

const DeleteAccess = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedAccess) {
    return null;
  }

  const deleteAccess = async () => {
    if (
      props.selectedAccess.assignments.length > 0 &&
      !window.confirm(
        'This access is currently assigned, are you sure you want to delete it?'
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await props.deleteAccess(props.selectedAccess);
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
        className='access-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Delete {props.selectedAccess.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>

        <ModalBody className='p-6'>
          <AccessEditValues
            selectedAccess={props.selectedAccess}
            disableEditing={true}
          />
        </ModalBody>
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button color='error' onClick={deleteAccess} disabled={submitting}>
            Go! {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteAccess;
