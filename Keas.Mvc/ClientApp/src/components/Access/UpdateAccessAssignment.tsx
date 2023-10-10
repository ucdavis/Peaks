import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IAccess, IAccessAssignment, accessSchema } from '../../models/Access';
import { IPerson } from '../../models/People';
import { addYears, format, startOfDay } from 'date-fns';
import AssignDate from '../Shared/AssignDate';
import AccessEditValues from './AccessEditValues';
import { IValidationError, yupAssetValidation } from '../../models/Shared';

interface IProps {
  isModalOpen: boolean;
  person?: IPerson;
  accessAssignment: IAccessAssignment; // and valid assignment
  selectedAccess: IAccess;
  closeModal: () => void;
  onUpdate: (access: IAccess, date: any, person: IPerson) => Promise<void>;
}

const UpdateAccessAssignment = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [date, setDate] = useState<Date>(
    !!props.accessAssignment
      ? new Date(props.accessAssignment.expiresAt)
      : addYears(startOfDay(new Date()), 3)
  );
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    if (!props.accessAssignment) {
      return;
    }
    const validateState = () => {
      const error = yupAssetValidation(
        accessSchema,
        props.selectedAccess,
        {
          // assume it is valid to update an assignment to the same person
        },
        { date: date, person: props.accessAssignment.person }
      );

      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [date, props.person, props.selectedAccess, props.accessAssignment]);

  // assign the selected access even if we have to create it
  const updateSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await props.onUpdate(
        props.selectedAccess,
        format(date, 'MM/dd/yyyy'),
        props.accessAssignment.person
      );
    } finally {
      setSubmitting(false);
    }
    closeModal();
  };

  const changeDate = (newDate: Date) => {
    setDate(startOfDay(new Date(newDate)));
  };

  // clear everything out on close
  const confirmClose = () => {
    if (!window.confirm('Please confirm you want to close!')) {
      return;
    }

    closeModal();
  };

  const closeModal = () => {
    setDate(addYears(startOfDay(new Date()), 3));
    setError({
      message: '',
      path: ''
    });
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };
  return (
    <Modal
      isOpen={props.isModalOpen}
      toggle={confirmClose}
      size='lg'
      className='access-color'
      // scrollable={!!access && !!access.teamId} // will be false when we are creating a new access
      // modal is too short for this to render properly on mobile
    >
      <div className='modal-header row justify-content-between'>
        <h2>Update Access</h2>
        <Button color='link' onClick={closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>
        <div className='container-fluid'>
          <form>
            <div className='form-group'>
              <label>Assigned To</label>
              <input
                type='text'
                className='form-control'
                disabled={true}
                value={
                  !!props.accessAssignment?.person
                    ? props.accessAssignment.person.name
                    : ''
                }
              />
            </div>
            <AssignDate
              date={date}
              isRequired={true}
              error={error}
              onChangeDate={changeDate}
            />
            <div>
              <div className='row justify-content-between'>
                <h3>Assign Exisiting Access</h3>
              </div>
              <AccessEditValues
                selectedAccess={props.selectedAccess}
                disableEditing={true}
                error={error}
              />
            </div>
          </form>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          onClick={updateSelected}
          disabled={!validState || submitting}
        >
          Go! {submitting && <i className='fas fa-circle-notch fa-spin' />}
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};
export default UpdateAccessAssignment;
