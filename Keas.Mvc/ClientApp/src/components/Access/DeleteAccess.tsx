import * as React from 'react';
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
        scrollable={true}
      >
        <div className='modal-header row justify-content-between'>
          <h2>Delete {props.selectedAccess.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <AccessEditValues
            selectedAccess={props.selectedAccess}
            disableEditing={true}
          />
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={deleteAccess} disabled={submitting}>
            Go! {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteAccess;
