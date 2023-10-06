import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
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
        size='lg'
        className='keys-color'
        scrollable={false}
      >
        <div className='modal-header row justify-content-between'>
          <h2>Create Key</h2>
          <Button color='link' onClick={closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
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
            color='primary'
            onClick={editSelected}
            disabled={!validState || submitting}
          >
            Go!
            {submitting && <i className='fas fa-circle-notch fa-spin ml-2' />}
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
    if (!confirm('Please confirm you want to close!')) {
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
      <Button color='link' onClick={props.onOpenModal}>
        <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Key
      </Button>
      {renderModal()}
    </div>
  );
};

export default CreateKey;
