import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
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

const CreatePerson = (props: IProps) => {
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [moreInfoString, setMoreInfoString] = useState<string>('');
  const [person, setPerson] = useState<IPerson>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);
  const [existingPerson, setExistingPerson] = useState<IPerson>(null);
  const context = useContext(Context);
  const history = useHistory();

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
    setMoreInfoString('');
    setPerson(null);
    setSubmitting(false);
    setValidState(false);
    setExistingPerson(null);
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
      setExistingPerson(null);
    } else if (
      props.userIds.findIndex(x => x === selectedPerson.userId) !== -1 ||
      (selectedPerson.active && selectedPerson.teamId !== 0)
    ) {
      setMoreInfoString(
        'The user you have chosen is already active in this team.'
      );
      setPerson(null);
      setExistingPerson(selectedPerson);
    } else if (selectedPerson.active && selectedPerson.teamId === 0) {
      setMoreInfoString('You are creating a new person.');
      setPerson(selectedPerson);
      setExistingPerson(null);
    } else {
      setMoreInfoString(
        'This person was set to inactive. Continuing will set them to active.'
      );
      setPerson(selectedPerson);
      setExistingPerson(null);
    }
  };

  const viewExistingPerson = () => {
    // done this way to clear state and navigate to details page in the same tab
    // since i think this should behave like if you click "person details" from the table
    closeModal();
    const { team } = context;
    history.push(`/${team.slug}/people/details/${existingPerson.id}`);
  };

  return (
    <div>
      <Button color='asset' size='sm' onClick={props.onAddNew}>
        <PlusIcon data-icon="plus" className='hero-icon size-4' aria-hidden='true' /> Add Person
      </Button>
      <Modal
        isOpen={props.modal}
        toggle={confirmClose}
        className='people-color'
      >
        <ModalHeading>Add Person</ModalHeading>
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
            {existingPerson && (
              <Button color='link' type='button' onClick={viewExistingPerson}>
                <UserIcon data-icon="user" className='hero-icon size-4' aria-hidden='true' /> View
                Existing Person
              </Button>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='asset'
            onClick={createSelected}
            disabled={!validState || submitting}
          >
            Add {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CreatePerson;
