import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { accessSchema, IAccess } from '../../models/Access';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AccessEditValues from './AccessEditValues';

interface IProps {
  onEdit: (access: IAccess) => void;
  closeModal: () => void;
  modal: boolean;
  tags: string[];
  selectedAccess: IAccess;
}

const EditAccess = (props: IProps) => {
  const [access, setAccess] = useState<IAccess>(props.selectedAccess);
  const [submitting, setSubmit] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(accessSchema, access);
      setError(error);
      setValidState(error.message === '');
    };
    validateState();
  }, [access]);

  // assign the selected access even if we have to create it
  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmit(true);
    try {
      await props.onEdit(access);
    } catch (err) {
      setSubmit(false);
      return;
    }
    closeModal();
  };

  // clear everything out on close
  const confirmClose = () => {
    if (!window.confirm('Please confirm you want to close!')) {
      return;
    }
    closeModal();
  };

  const closeModal = () => {
    setAccess(null);
    setError({ message: '', path: '' });
    setSubmit(false);
    setValidState(false);
    props.closeModal();
  };

  if (!access) {
    return null;
  }

  return (
    <Modal
      isOpen={props.modal}
      toggle={confirmClose}
      size='lg'
      className='access-color'
    >
      <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
        <h2 className="text-xl font-semibold">Edit Access</h2>
        <Button color='link' onClick={closeModal}>
          <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
        </Button>
      </div>
      <ModalBody className='p-6'>
        <div className='container-fluid'>
          <form>
            <AccessEditValues
              selectedAccess={access}
              disableEditing={false}
              onAccessUpdate={
                access => {
                  setAccess(access);
                  setValidState(true);
                }
                // this.setState({ access }, validateState)
              }
              tags={props.tags}
              error={error}
            />
          </form>
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

export default EditAccess;
