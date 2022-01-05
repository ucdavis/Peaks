import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IPerson, personSchema } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { validateEmail } from '../../util/email';
import PersonEditValues from './PersonEditValues';
import SearchUsers from './SearchUsers';

interface IProps {
  onCreate: (person: IPerson) => void;
  modal: boolean;
  tags: string[];
  userIds: string[];
  onAddNew: () => void;
  closeModal: () => void;
}

interface IState {
  error: IValidationError;
  moreInfoString: string; // for explaining results, e.g. if person is new or inactive
  person: IPerson;
  submitting: boolean;
  validState: boolean;
}

const CreatePerson = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [moreInfoString, setMoreInfoString] = useState<string>('');
  const [person, setPerson] = useState<IPerson>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(personSchema, person, {
        context: { validateEmail }
      });
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [person, moreInfoString]);

  const changeProperty = (property: string, value: string) => {
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
    setError({
      message: '',
      path: ''
    });
    setMoreInfoString('');
    setPerson(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  const createSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await props.onCreate(person);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  // once we have selected a user from SearchUser
  const onSelectPerson = (selectedPerson: IPerson) => {
    if (selectedPerson === null) {
      // if there was a 404, person will be null
      // on other errors, SearchUsers will make a toast
      setMoreInfoString(
        'The user could not be found. Please make sure you are searching the correct kerberos or email.'
      );
      setPerson(null);
    } else if (
      props.userIds.findIndex(x => x === selectedPerson.userId) !== -1 ||
      (selectedPerson.active && selectedPerson.teamId !== 0)
    ) {
      setMoreInfoString(
        'The user you have chosen is already active in this team.'
      );
      setPerson(null);
    } else if (selectedPerson.active && selectedPerson.teamId === 0) {
      setMoreInfoString('You are creating a new person.');
      setPerson(selectedPerson);
    } else {
      setMoreInfoString(
        'This person was set to inactive. Continuing will set them to active.'
      );
      setPerson(selectedPerson);
    }
  };

  return (
    <div>
      <Button color='link' onClick={props.onAddNew}>
        <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Person
      </Button>
      <Modal
        isOpen={props.modal}
        toggle={confirmClose}
        size='lg'
        className='people-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Add Person</h2>
          <Button color='link' onClick={closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <div className='container-fluid'>
            <div className='form-group'>
              <SearchUsers updatePerson={onSelectPerson} />
            </div>

            <div className='form-group'>
              <PersonEditValues
                selectedPerson={person}
                changeProperty={changeProperty}
                changeSupervisor={changeSupervisor}
                disableEditing={false}
                tags={props.tags}
                error={error}
                isDeleting={false}
              />
            </div>

            {moreInfoString}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={createSelected}
            disabled={!validState || submitting}
          >
            Add {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CreatePerson;
