import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import KeyEditValues from './KeyEditValues';

interface IProps {
  modal: boolean;
  selectedKeyInfo: IKeyInfo;
  closeModal: () => void;
  deleteKey: (key: IKey) => void;
}

const DeleteKey = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedKeyInfo) {
    return null;
  }

  const deleteKey = async () => {
    if (
      !!props.selectedKeyInfo.serialsInUseCount &&
      !window.confirm(
        'This key has serials that are currently assigned, are you sure you want to delete it?'
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await props.deleteKey(props.selectedKeyInfo.key);
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
        className='keys-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Delete {props.selectedKeyInfo.key.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>

        <ModalBody>
          <KeyEditValues
            selectedKey={props.selectedKeyInfo.key}
            disableEditing={true}
          />
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={deleteKey} disabled={submitting}>
            Go! {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteKey;
