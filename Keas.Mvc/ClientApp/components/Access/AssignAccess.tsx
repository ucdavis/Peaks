import { addYears, format, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { accessSchema, IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AssignPerson from '../People/AssignPerson';
import { AssignDate } from '../Shared/AssignDate';
import AccessAssignmentCard from './AccessAssignmentCard';
import AccessAssignmentTable from './AccessAssignmentTable';
import AccessEditValues from './AccessEditValues';
import SearchAccess from './SearchAccess';

interface IProps {
  modal: boolean;
  person?: IPerson;
  selectedAccess?: IAccess;
  tags: string[];
  closeModal: () => void;
  onCreate: (access: IAccess, date: any, person: IPerson) => Promise<void>;
}

const AssignAccess = (props: IProps) => {
  const [access, setAccess] = useState<IAccess>(props.selectedAccess);
  const [person, setPerson] = useState<IPerson>(null);
  const [date, setDate] = useState<Date>(addYears(startOfDay(new Date()), 3));
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      const personData = props.person ? props.person : person;
      const personId = personData ? personData.id : null;
      const error = yupAssetValidation(
        accessSchema,
        access,
        {
          context: { checkValidAssignmentToPerson, personId }
        },
        { date: date, person }
      );
      // duplicate assignments are checked on access.assignments
      // but we want it to show up under the person input
      if (error.path === 'assignments') {
        error.path = 'person';
      }

      setError(error);
      setPerson(props.person ? props.person : person);
      setValidState(error.message === '');
    };

    validateState();
  }, [access, date, person, props.person]);

  // clear everything out on close
  const confirmClose = () => {
    if (!confirm('Please confirm you want to close!')) {
      return;
    }

    closeModal();
  };

  const closeModal = () => {
    setAccess(null);
    setDate(addYears(startOfDay(new Date()), 3));
    setError({
      message: '',
      path: ''
    });
    setPerson(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  // assign the selected access even if we have to create it
  const assignSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    const personData = props.person ? props.person : person;

    try {
      await props.onCreate(access, format(date, 'MM/dd/yyyy'), personData);
    } finally {
      setSubmitting(false);
    }

    closeModal();
  };

  // once we have either selected or created the access we care about
  const onSelected = (selectedAccess: IAccess) => {
    setAccess(selectedAccess);
  };

  const onDeselected = () => {
    setAccess(null);
    setError({
      message: '',
      path: ''
    });
  };

  const onSelectPerson = (selectedPerson: IPerson) => {
    setPerson(selectedPerson);
  };

  const checkValidAssignmentToPerson = (
    assignments: IAccessAssignment[],
    personId: number
  ) => {
    let valid = true;
    for (const a of assignments) {
      if (a.personId === personId) {
        valid = false;
        break;
      }
    }
    return valid;
  };

  const changeDate = (newDate: Date) => {
    setDate(startOfDay(new Date(newDate)));
  };

  return (
    <Modal
      isOpen={props.modal}
      toggle={confirmClose}
      size='lg'
      className='access-color'
    >
      <div className='modal-header row justify-content-between'>
        <h2>
          {props.selectedAccess || props.person
            ? 'Assign Access'
            : 'Add Access'}
        </h2>
        <Button color='link' onClick={closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>
        <div className='container-fluid'>
          <form>
            <div className='form-group'>
              <AssignPerson
                disabled={!!props.person}
                person={props.person || person}
                onSelect={onSelectPerson}
                label='Assign To'
                isRequired={access && access.teamId !== 0}
                error={error}
              />
            </div>
            {(!!person || !!props.person) && (
              <AssignDate
                date={date}
                isRequired={true}
                error={error}
                onChangeDate={changeDate}
              />
            )}
            {!access && (
              <div className='form-group'>
                <SearchAccess onSelect={onSelected} onDeselect={onDeselected} />
              </div>
            )}
            {!!access &&
            !access.teamId && ( // if we are creating a new access, edit properties
                <div>
                  <div className='row justify-content-between'>
                    <h3>Create New Access</h3>
                    <Button color='link' onClick={onDeselected}>
                      Clear{' '}
                      <i className='fas fa-times fa-sm' aria-hidden='true' />
                    </Button>
                  </div>
                  <AccessEditValues
                    selectedAccess={access}
                    disableEditing={false}
                    onAccessUpdate={selectedAccess => setAccess(selectedAccess)}
                    tags={props.tags}
                    error={error}
                  />
                </div>
              )}
            {!!access && !!access.teamId && (
              <div>
                <div className='row justify-content-between'>
                  <h3>Assign Exisiting Access</h3>
                  <Button color='link' onClick={onDeselected}>
                    Clear{' '}
                    <i className='fas fa-times fa-sm' aria-hidden='true' />
                  </Button>
                </div>
                <AccessEditValues
                  selectedAccess={access}
                  disableEditing={true}
                  tags={props.tags}
                  error={error}
                >
                  <AccessAssignmentCard disableEditing={true}>
                    <AccessAssignmentTable assignments={access.assignments} />
                  </AccessAssignmentCard>
                </AccessEditValues>
              </div>
            )}
          </form>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          onClick={assignSelected}
          disabled={!validState || submitting}
        >
          Go! {submitting && <i className='fas fa-circle-notch fa-spin' />}
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};

export default AssignAccess;
