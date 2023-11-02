import { addYears, format, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Form, Modal, ModalBody, ModalFooter } from 'reactstrap';
import {
  equipmentSchema,
  IEquipment,
  IEquipmentAttribute
} from '../../models/Equipment';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import AssignPerson from '../People/AssignPerson';
import AssignDate from '../Shared/AssignDate';
import EquipmentEditValues from './EquipmentEditValues';
import SearchEquipment from './SearchEquipment';

interface IProps {
  onCreate: (person: IPerson, equipment: IEquipment, date: any) => void;
  modal: boolean;
  onAddNew: () => void;
  openDetailsModal: (equipment: IEquipment) => void;
  openEditModal: (equipment: IEquipment) => void;
  closeModal: () => void;
  selectedEquipment: IEquipment;
  person?: IPerson;
  space: ISpace;
  tags: string[];
  commonAttributeKeys: string[];
  equipmentTypes: string[];
}

const AssignEquipment = (props: IProps) => {
  // if we are on the person page, we use that person and don't allow changing it
  // if we are creating, we initialize with a new object, a new date, and no person (unless we are on the person page)
  // if we are assigning, we initialize with the selected asset, a new date and the person from the assignment
  // if we are updating an assignment, we initialize with the selected asset, the date of the assignment, and the person from the assignment
  const [date, setDate] = useState<Date>(
    !!props.selectedEquipment && !!props.selectedEquipment.assignment
      ? new Date(props.selectedEquipment.assignment.expiresAt)
      : addYears(startOfDay(new Date()), 3)
  );
  const [equipment, setEquipment] = useState<IEquipment>(
    props.selectedEquipment
  );
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [person, setPerson] = useState<IPerson>(
    !!props.selectedEquipment && !!props.selectedEquipment.assignment
      ? props.selectedEquipment.assignment.person
      : props.person
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(
        equipmentSchema,
        equipment,
        {}, // no context
        { date: date, person: person }
      );
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [date, equipment, person]);

  const changeProperty = (property: string, value: string) => {
    setEquipment({ ...equipment, [property]: value });
  };

  const updateAttributes = (attributes: IEquipmentAttribute[]) => {
    setEquipment({ ...equipment, attributes: attributes });
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
    setEquipment(null);
    setError({
      message: '',
      path: ''
    });
    setPerson(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  // assign the selected equipment even if we have to create it
  const assignSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    const personData = props.person ? props.person : person;
    const equipmentData = equipment;
    equipmentData.attributes = equipmentData.attributes.filter(x => !!x.key);

    try {
      await props.onCreate(
        personData,
        equipmentData,
        format(date, 'MM/dd/yyyy')
      );
    } catch (e) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  // once we have either selected or created the equipment we care about
  const onSelected = (selectedEquipment: IEquipment) => {
    setEquipment(selectedEquipment);
  };

  const onDeselected = () => {
    setEquipment(null);
    setError({
      message: '',
      path: ''
    });
  };

  const onSelectPerson = (selectedPerson: IPerson) => {
    setPerson(selectedPerson);
  };

  const changeDate = (newDate: Date) => {
    setDate(new Date(newDate));
    setError({
      message: '',
      path: ''
    });
  };

  return (
    <Modal
      isOpen={props.modal}
      toggle={confirmClose}
      size='lg'
      className='equipment-color'
    >
      <div className='modal-header row justify-content-between'>
        <h2>
          {props.selectedEquipment || props.person
            ? 'Assign Equipment'
            : 'Add Equipment'}
        </h2>
        <Button color='link' onClick={closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>
        <div className='container-fluid'>
          <Form>
            <AssignPerson
              person={person}
              label='Assign To'
              onSelect={onSelectPerson}
              isRequired={equipment && equipment.teamId !== 0}
              disabled={
                !!props.person ||
                (!!props.selectedEquipment &&
                  !!props.selectedEquipment.assignment)
              } // disable if we are on person page or updating
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
            {!equipment && (
              <div className='form-group'>
                <SearchEquipment
                  selectedEquipment={equipment}
                  onSelect={onSelected}
                  onDeselect={onDeselected}
                  space={props.space}
                  openDetailsModal={props.openDetailsModal}
                />
              </div>
            )}
            {equipment &&
            !equipment.teamId && ( // if we are creating a new equipment, edit properties
                <div>
                  <div className='row justify-content-between'>
                    <h3>Create New Equipment</h3>
                    <Button color='link' onClick={onDeselected}>
                      Clear{' '}
                      <i className='fas fa-times fa-sm' aria-hidden='true' />
                    </Button>
                  </div>

                  <EquipmentEditValues
                    selectedEquipment={equipment}
                    commonAttributeKeys={props.commonAttributeKeys}
                    changeProperty={changeProperty}
                    disableEditing={false}
                    updateAttributes={updateAttributes}
                    space={props.space}
                    tags={props.tags}
                    equipmentTypes={props.equipmentTypes}
                    error={error}
                  />
                </div>
              )}
            {equipment && !!equipment.teamId && (
              <div>
                <div className='row justify-content-between'>
                  <h3>Assign Existing Equipment</h3>
                  <Button color='link' onClick={onDeselected}>
                    Clear{' '}
                    <i className='fas fa-times fa-sm' aria-hidden='true' />
                  </Button>
                </div>

                <EquipmentEditValues
                  selectedEquipment={equipment}
                  commonAttributeKeys={props.commonAttributeKeys}
                  disableEditing={true}
                  openEditModal={props.openEditModal}
                  tags={props.tags}
                  error={error}
                />
              </div>
            )}
          </Form>
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

export default AssignEquipment;
