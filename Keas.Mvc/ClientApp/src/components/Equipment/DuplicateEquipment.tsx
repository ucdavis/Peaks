import { Modal, ModalBody, ModalFooter } from '../Shared/AppModal';
import { ArrowPathIcon, DocumentDuplicateIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { addYears, format, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import {
  equipmentSchema,
  IEquipment,
  IEquipmentAttribute
} from '../../models/Equipment';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AssignPerson from '../People/AssignPerson';
import AssignDate from '../Shared/AssignDate';
import EquipmentEditValues from './EquipmentEditValues';

interface IProps {
  onDuplicate: (
    person: IPerson,
    equipment: IEquipment,
    date: string,
    onCreated: (equipment: IEquipment) => void
  ) => Promise<void>;
  modal: boolean;
  closeModal: () => void;
  selectedEquipment: IEquipment;
  person?: IPerson;
  tags: string[];
  commonAttributeKeys: string[];
  equipmentTypes: string[];
}

const DuplicateEquipment = (props: IProps) => {
  // Start a new record, keeping descriptive values but never the source identity or assignment.
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [date, setDate] = useState<Date>(addYears(startOfDay(new Date()), 3));
  const [equipment, setEquipment] = useState<IEquipment>(() => {
    // copy the selected equipment but clear unique fields
    if (props.selectedEquipment) {
      // equip may not be loaded yet
      return {
        attributes: (props.selectedEquipment.attributes || []).map(a => {
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
  const [saveError, setSaveError] = useState<string>('');

  useEffect(() => {
    const validateState = () => {
      const error = yupAssetValidation(
        equipmentSchema,
        equipment,
        {}, // no context
        person ? { date, person } : undefined
      );
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [date, equipment, person]);

  if (!equipment) {
    return null;
  }

  const changeProperty = (property: string, value: string) => {
    setEquipment({ ...equipment, [property]: value });
  };

  const updateAttributes = (attributes: IEquipmentAttribute[]) => {
    setEquipment({ ...equipment, attributes: attributes });
  };

  const confirmClose = () => {
    if (submitting) {
      return;
    }
    if (!equipment.id && !window.confirm('Discard this equipment copy?')) {
      return;
    }
    props.closeModal();
  };

  const saveCopy = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    setSaveError('');
    const equipmentData = {
      ...equipment,
      attributes: equipment.attributes.filter(attribute => !!attribute.key)
    };
    try {
      await props.onDuplicate(
        person,
        equipmentData,
        person ? format(date, 'MM/dd/yyyy') : '',
        setEquipment
      );
    } catch (e) {
      setSaveError(e.message || 'Your changes are still here. Please try again.');
      setSubmitting(false);
      return;
    }
    props.closeModal();
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
      className='equipment-color equipment-duplicate-modal'
      labelledBy='equipment-duplicate-title'
    >
      <div className='flex items-start justify-between gap-4 rounded-t-box border-b-[3px] border-asset-color p-5 sm:px-8 sm:py-6'>
        <div className='min-w-0'>
          <p className='mb-1 text-sm text-base-content/60'>Duplicate equipment</p>
          <h2 id='equipment-duplicate-title' className='break-words text-2xl font-semibold'>{props.selectedEquipment.name}</h2>
        </div>
        <button type='button' className='btn btn-ghost btn-square btn-sm shrink-0'
          aria-label='Close equipment duplicate' onClick={confirmClose} disabled={submitting}>
          <XMarkIcon className='size-5' aria-hidden='true' />
        </button>
      </div>
      <form id='duplicate-equipment-form' onSubmit={saveCopy} aria-busy={submitting}
        onKeyDown={event => {
          // Enter in a lookup selects a result; it must not save while results are loading.
          if (event.key === 'Enter' && (event.target as HTMLElement).getAttribute('role') === 'combobox') {
            event.preventDefault();
          }
        }}>
      <ModalBody>
        <div className='rounded-box border border-main-border bg-base-200 p-4 text-sm'>
          Create a new record using this equipment’s details. Review the values below and enter the new serial number or identifier.
        </div>
        {saveError && (
          <div role='alert' className='alert alert-error'>
            {equipment.id
              ? `Your new equipment has been saved. ${saveError}`
              : saveError}
          </div>
        )}
        <fieldset disabled={submitting} className='min-w-0 space-y-6'>
          <EquipmentEditValues
            spacious
            selectedEquipment={equipment}
            commonAttributeKeys={props.commonAttributeKeys}
            changeProperty={changeProperty}
            disableEditing={!!equipment.id}
            updateAttributes={updateAttributes}
            tags={props.tags}
            equipmentTypes={props.equipmentTypes}
            error={error}
            duplicate={true}
          />
          <section className='space-y-4 border-t border-main-border pt-6' aria-labelledby='duplicate-assignment-title'>
            <div>
              <h3 id='duplicate-assignment-title' className='text-lg font-semibold'>Assignment <span className='text-sm font-normal text-base-content/60'>(optional)</span></h3>
              <p className='mt-1 text-sm text-base-content/70'>Choose who will receive the new equipment, or leave it unassigned.</p>
            </div>
            <div className='grid min-w-0 gap-5 sm:grid-cols-2'>
              <AssignPerson
                person={person}
                label='Assign to'
                onSelect={onSelectPerson}
                isRequired={false}
                disabled={false}
                error={error}
              />
              {!!person && (
                <AssignDate
                  date={date}
                  isRequired={true}
                  error={error}
                  onChangeDate={changeDate}
                />
              )}
            </div>
          </section>
        </fieldset>
      </ModalBody>
      </form>
      <ModalFooter showCancel={false}>
        <button type='button' className='btn btn-ghost' onClick={confirmClose} disabled={submitting}>Cancel</button>
        <Button
          type='submit'
          form='duplicate-equipment-form'
          color='asset'
          disabled={!validState || submitting}
        >
          {submitting
            ? <ArrowPathIcon className='hero-icon size-5 animate-spin' aria-hidden='true' />
            : <DocumentDuplicateIcon className='hero-icon size-5' aria-hidden='true' />}
          {submitting ? 'Saving…' : equipment.id ? 'Save assignment' : 'Save as new equipment'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DuplicateEquipment;
