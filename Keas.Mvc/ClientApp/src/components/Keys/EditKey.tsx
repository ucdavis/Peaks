import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKey, keySchema } from '../../models/Keys';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import KeyEditValues from './KeyEditValues';

interface IProps {
  modal: boolean;
  selectedKey: IKey;
  searchableTags: string[];
  onEdit: (key: IKey) => void;
  closeModal: () => void;
  checkIfKeyCodeIsValid: (code: string, id: number) => boolean;
}

const EditKey = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [key, setKey] = useState<IKey>(props.selectedKey);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);
  const formRef: React.RefObject<HTMLFormElement> = useRef(null);

  useEffect(() => {
    const validateState = () => {
      const checkIfKeyCodeIsValid = props.checkIfKeyCodeIsValid;
      const error = yupAssetValidation(keySchema, key, {
        context: { checkIfKeyCodeIsValid }
      });
      setError(error);
      setValidState(error.message === '');
    };
    validateState();
  }, [key, props.checkIfKeyCodeIsValid]);

  if (!key) {
    return null;
  }

  const { searchableTags } = props;
  const changeProperty = (property: string, value: string) => {
    setKey({ ...key, [property]: value });
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
    setKey(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await props.onEdit(key);
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
      className='keys-color'
    >
      <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
        <h2 className="text-xl font-semibold">Edit Key</h2>
        <Button color='link' onClick={closeModal}>
          <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
        </Button>
      </div>
      <ModalBody className='p-6'>
        <div className='container-fluid'>
          <form ref={formRef}>
            <KeyEditValues
              selectedKey={key}
              changeProperty={changeProperty}
              disableEditing={false}
              searchableTags={searchableTags}
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

export default EditKey;
