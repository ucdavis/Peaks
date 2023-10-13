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

interface IProps {
  onDuplicate: (
    person: IPerson,
    equipment: IEquipment,
    date: any,
    duplicate?: boolean
  ) => void;
  modal: boolean;
  closeModal: () => void;
  selectedEquipment: IEquipment;
  person?: IPerson;
  space: ISpace;
  tags: string[];
  commonAttributeKeys: string[];
  equipmentTypes: string[];
}

const DuplicateEquipment = (props: IProps) => {
  // if we are on the person page, we use that person and don't allow changing it
  // if we are duplicating an assignment, we initialize with the selected asset, a new date, and no person (unless we are on the person page)
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [date, setDate] = useState<Date>(addYears(startOfDay(new Date()), 3));
  const [equipment, setEquipment] = useState<IEquipment>(() => {
    // copy the selected equipment but clear unique fields
    if (!!props.selectedEquipment) {
      // equip may not be loaded yet
      return {
        attributes: props.selectedEquipment.attributes.map(a => {
          return { ...a, equipmentId: 0, id: 0 };
        }),
        availabilityLevel: props.selectedEquipment.availabilityLevel,
        id: 0,
        make: props.selectedEquipment.make,
        model: props.selectedEquipment.model,
        name: props.selectedEquipment.name,
        notes: props.selectedEquipment.notes,
        protectionLevel: props.selectedEquipment.protectionLevel,
        serialNumber: '', // serial number is not duplicated
        space: props.selectedEquipment.space,
        systemManagementId: '', // system management id is not duplicated
        tags: props.selectedEquipment.tags,
        teamId: 0,
        type: props.selectedEquipment.type
      };
    }
    return null;
  });
  const [person, setPerson] = useState<IPerson>(props.person);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      let error = yupAssetValidation(
        equipmentSchema,
        equipment,
        {}, // no context
        { date: date, person: person }
      );
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [date, equipment, person, props.selectedEquipment]);

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
      await props.onDuplicate(
        personData,
        equipmentData,
        format(date, 'MM/dd/yyyy'),
        true
      );
    } catch (e) {
      setSubmitting(false);
      return;
    }
    closeModal();
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
      scrollable={!!equipment && !!equipment.teamId} // will be false when we are creating a new equipment
    >
      <div className='modal-header row justify-content-between'>
        <h2>Duplicate Equipment</h2>
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
              isRequired={equipment && equipment.teamId !== 0} //teamId is 0 on create or dupe
              disabled={
                !!props.person || //if on person page
                (!!equipment && !!equipment.assignment) // if updating currently assigned (taken care of in initial state)
              }
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
            <div>
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
                duplicate={true}
              />
            </div>
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

export default DuplicateEquipment;
