import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { IKey, keySchema } from '../../models/Keys';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import KeyEditValues from './KeyEditValues';

interface IProps {
  modal: boolean;
  searchableTags: string[];
  onCreate: (key: IKey) => void;
  onOpenModal: () => void;
  closeModal: () => void;
  checkIfKeyCodeIsValid: (code: string) => boolean;
}

const CreateKey = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [key, setKey] = useState<IKey>({
    code: '',
    id: 0,
    name: '',
    notes: '',
    serials: [],
    tags: '',
    teamId: 0
  });
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

  const renderModal = () => {
    const { searchableTags } = props;

    return (
      <Modal
        isOpen={props.modal}
        toggle={confirmClose}
        className='keys-color'
      >
        <ModalHeading>Create Key</ModalHeading>
        <ModalBody>
          <form ref={formRef}>
            <KeyEditValues
              selectedKey={key}
              changeProperty={changeProperty}
              disableEditing={false}
              searchableTags={searchableTags}
              error={error}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            color='asset'
            onClick={editSelected}
            disabled={!validState || submitting}
          >
            Create
            {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin ml-2' />}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

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
    setError({ message: '', path: '' });
    setKey({
      code: '',
      id: 0,
      name: '',
      notes: '',
      serials: [],
      tags: '',
      teamId: 0
    });
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  // assign the selected key even if we have to create it
  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await props.onCreate(key);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  return (
    <div>
      <Button color='asset' size='sm' onClick={props.onOpenModal}>
        <PlusIcon data-icon="plus" className='hero-icon size-4' aria-hidden='true' /> Add Key
      </Button>
      {renderModal()}
    </div>
  );
};

export default CreateKey;
