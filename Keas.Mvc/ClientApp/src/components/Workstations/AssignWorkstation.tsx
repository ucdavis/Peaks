import { addYears, format, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import { IWorkstation, workstationSchema } from '../../models/Workstations';
import AssignPerson from '../People/AssignPerson';
import AssignDate from '../Shared/AssignDate';
import SearchWorkstations from './SearchWorkstations';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  onCreate: (person: IPerson, workstation: IWorkstation, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  closeModal: () => void;
  openDetailsModal: (workstation: IWorkstation) => void;
  openEditModal: (workstation: IWorkstation) => void;
  selectedWorkstation: IWorkstation;
  person?: IPerson;
  space?: ISpace;
  tags: string[];
}

const AssignWorkstation = (props: IProps) => {
  const [date, setDate] = useState<Date>(
    !!props.selectedWorkstation && !!props.selectedWorkstation.assignment
      ? new Date(props.selectedWorkstation.assignment.expiresAt)
      : addYears(startOfDay(new Date()), 3)
  );
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [person, setPerson] = useState<IPerson>(
    !!props.selectedWorkstation && !!props.selectedWorkstation.assignment
      ? props.selectedWorkstation.assignment.person
      : props.person
  );
  const [workstation, setWorkstation] = useState<IWorkstation>(
    props.selectedWorkstation
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(
        workstationSchema,
        workstation,
        {}, // no context
        { date: date, person: person }
      );
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [workstation, person, date]);

  const changeProperty = (property: string, value: string) => {
    setWorkstation({ ...workstation, [property]: value });
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
    setPerson(null);
    setWorkstation(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  // assign the selected workstation even if we have to create it
  const assignSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    const personData = props.person ? props.person : person;

    try {
      await props.onCreate(personData, workstation, format(date, 'MM/dd/yyyy'));
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  // once we have either selected or created the workstation we care about
  const onSelected = (workstation: IWorkstation) => {
    setWorkstation(workstation);
  };

  const onDeselected = () => {
    setError({
      message: '',
      path: ''
    });
    setWorkstation(null);
  };

  const onSelectPerson = (person: IPerson) => {
    setPerson(person);
  };

  const changeDate = (newDate: Date) => {
    setDate(startOfDay(new Date(newDate)));
  };

  return (
    <div>
      <Modal
        isOpen={props.modal}
        toggle={confirmClose}
        size='lg'
        className='spaces-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            {props.selectedWorkstation || props.person
              ? 'Assign Workstation'
              : 'Add Workstation'}
          </h2>
          <Button color='link' onClick={closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <div className='container-fluid'>
            <form>
              <AssignPerson
                disabled={
                  !!props.person ||
                  (!!props.selectedWorkstation &&
                    !!props.selectedWorkstation.assignment)
                } // disable if we are on person page or updating
                person={props.person || person}
                label='Assign To'
                onSelect={onSelectPerson}
                isRequired={workstation && workstation.teamId !== 0}
                error={error}
              />
              {(!!person || !!props.person) && (
                <AssignDate
                  date={date}
                  isRequired={true}
                  error={error}
                  onChangeDate={changeDate}
                />
              )}
              {!workstation && (
                <div className='form-group'>
                  <SearchWorkstations
                    selectedWorkstation={workstation}
                    onSelect={onSelected}
                    onDeselect={onDeselected}
                    space={props.space}
                    openDetailsModal={props.openDetailsModal}
                  />
                </div>
              )}
              {workstation &&
              !workstation.teamId && ( // if we are creating a new workstation, edit properties
                  <div>
                    <div className='row justify-content-between'>
                      <h3>Create New Workstation</h3>
                      <Button color='link' onClick={onDeselected}>
                        Clear{' '}
                        <i className='fas fa-times fa-sm' aria-hidden='true' />
                      </Button>
                    </div>
                    <WorkstationEditValues
                      tags={props.tags}
                      selectedWorkstation={workstation}
                      changeProperty={changeProperty}
                      disableEditing={false}
                      disableSpaceEditing={false}
                      error={error}
                    />
                  </div>
                )}
              {!!workstation && !!workstation.teamId && (
                <div>
                  <div className='row justify-content-between'>
                    <h3>Assign Existing Workstation</h3>
                    <Button color='link' onClick={onDeselected}>
                      Clear{' '}
                      <i className='fas fa-times fa-sm' aria-hidden='true' />
                    </Button>
                  </div>
                  <WorkstationEditValues
                    selectedWorkstation={workstation}
                    disableEditing={true}
                    openEditModal={props.openEditModal}
                    disableSpaceEditing={true}
                  />
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
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AssignWorkstation;
