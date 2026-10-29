import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button } from 'reactstrap';
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
        className='access-color'
      >
        <ModalHeading>Delete {props.selectedAccess.name}</ModalHeading>

        <ModalBody>
          <AccessEditValues
            selectedAccess={props.selectedAccess}
            disableEditing={true}
          />
        </ModalBody>
        <ModalFooter>
          <Button color='error' onClick={deleteAccess} disabled={submitting}>
            Delete {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteAccess;
