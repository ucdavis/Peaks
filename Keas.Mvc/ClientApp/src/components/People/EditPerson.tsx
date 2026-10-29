import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import {
  ArrowPathIcon,
  PencilSquareIcon,
  } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { IPerson, personSchema } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { validateEmail } from '../../util/email';
import PersonEditValues from './PersonEditValues';

interface IProps {
  onEdit: (person: IPerson) => void;
  selectedPerson: IPerson;
  tags: string[];
}

const EditPerson = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [modal, setModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);
  const [person, setPerson] = useState<IPerson>(props.selectedPerson);

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(personSchema, person, {
        context: { validateEmail }
      });
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [person]);

  if (!person) {
    return null;
  }

  const changeProperty = (property: string, value: any) => {
    setPerson({ ...person, [property]: value });
  };

  const changeSupervisor = (supervisor: IPerson) => {
    setPerson({
      ...person,
      supervisor: supervisor,
      supervisorId: supervisor !== null ? supervisor.id : null
    });
  };

  // clear everything out on close
  const confirmClose = () => {
    if (!window.confirm('Please confirm you want to close!')) {
      return;
    }

    closeModal();
  };

  const closeModal = () => {
    setPerson(props.selectedPerson);
    setError({
      message: '',
      path: ''
    });
    setModal(false);
    setSubmitting(false);
    setValidState(false);
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  // assign the selected key even if we have to create it
  const editSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await props.onEdit(person);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  return (
    <div>
      <Button color='asset' size='sm' onClick={toggleModal}>
        <PencilSquareIcon
          data-icon='pencil-square'
          className='hero-icon size-4 mr-2'
          aria-hidden='true'
        />
        Edit Person
      </Button>
      <Modal
        isOpen={modal}
        toggle={confirmClose}
        className='people-color'
      >
        <ModalHeading>Edit Person</ModalHeading>
        <ModalBody>
          <div className='space-y-6'>
            <form className='space-y-6'>
              <PersonEditValues
                selectedPerson={person}
                changeProperty={changeProperty}
                changeSupervisor={changeSupervisor}
                disableEditing={false}
                tags={props.tags}
                error={error}
                isDeleting={false}
              />
            </form>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='asset'
            onClick={editSelected}
            disabled={!validState || submitting}
          >
            Save changes{' '}
            {submitting && (
              <ArrowPathIcon
                data-icon='arrow-path'
                className='hero-icon size-5 animate-spin'
              />
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditPerson;
