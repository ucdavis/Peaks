import {
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IPerson, IPersonInfo } from '../../models/People';
import PersonEditValues from './PersonEditValues';

interface IProps {
  onDelete: (person: IPerson) => void;
  selectedPersonInfo: IPersonInfo;
}

const DeletePerson = (props: IProps) => {
  const [modal, setModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedPersonInfo || !props.selectedPersonInfo.person) {
    return null;
  }

  const checkValidToDelete = () => {
    return !(
      props.selectedPersonInfo.accessCount > 0 ||
      props.selectedPersonInfo.equipmentCount > 0 ||
      props.selectedPersonInfo.keyCount > 0 ||
      props.selectedPersonInfo.workstationCount > 0
    );
  };

  const deletePerson = async () => {
    if (!checkValidToDelete()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.onDelete(props.selectedPersonInfo.person);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    // do not need to manage state here since it is unmounted after delete
    setSubmitting(false);
    toggleModal();
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  return (
    <div>
      <Button color='error' size='sm' outline onClick={toggleModal}>
        <TrashIcon
          data-icon='trash'
          className='hero-icon size-4 mr-2'
          aria-hidden='true'
        />
        Delete Person
      </Button>
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        size='lg'
        className='people-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className='text-xl font-semibold'>
            Delete {props.selectedPersonInfo.person.name}
          </h2>
          <Button color='link' onClick={toggleModal}>
            <XMarkIcon data-icon='x-mark' className='hero-icon size-6' />
          </Button>
        </div>

        <ModalBody className='p-6'>
          <PersonEditValues
            selectedPerson={props.selectedPersonInfo.person}
            disableEditing={true}
            isDeleting={true}
          />
          {!checkValidToDelete() && (
            <div>
              The person you have selected currently has assets assigned to
              them. Please revoke everything before deleting.
            </div>
          )}
        </ModalBody>
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button
            color='error'
            onClick={deletePerson}
            disabled={submitting || !checkValidToDelete()}
          >
            Go!{' '}
            {submitting && (
              <ArrowPathIcon
                data-icon='arrow-path'
                className='hero-icon size-5 animate-spin'
              />
            )}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeletePerson;
