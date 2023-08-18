import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
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
    if (!confirm('Please confirm you want to close!')) {
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
      <Button color='link' onClick={toggleModal}>
        <i className='fas fa-edit fa-sm fa-fw mr-2' aria-hidden='true' />
        Edit Person
      </Button>
      <Modal
        isOpen={modal}
        toggle={confirmClose}
        size='lg'
        className='people-color'
        scrollable={true}
      >
        <div className='modal-header row justify-content-between'>
          <h2>Edit Person</h2>
          <Button color='link' onClick={closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <form>
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
            color='primary'
            onClick={editSelected}
            disabled={!validState || submitting}
          >
            Go! {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditPerson;
