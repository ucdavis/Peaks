import { AssetActions } from '../Shared/AssetSummary';
import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { addYears, format, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Form } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import { IKeySerial, keySerialSchema } from '../../models/KeySerials';
import { IPerson } from '../../models/People';
import { IValidationError, yupAssetValidation } from '../../models/Shared';
import AssignPerson from '../People/AssignPerson';
import AssignDate from '../Shared/AssignDate';
import KeySerialEditValues from './KeySerialEditValues';
import SearchKeys from './SearchKeys';
import SearchKeySerial from './SearchKeySerials';

interface IProps {
  person?: IPerson;
  selectedKey: IKey;
  selectedKeySerial: IKeySerial;
  statusList: string[];
  isModalOpen: boolean;
  onCreate: (person: IPerson, keySerial: IKeySerial, date: any) => void;
  onOpenModal: () => void;
  closeModal: () => void;
  openEditModal: (keySerial: IKeySerial) => void;
  openDetailsModal: (keySerial: IKeySerial) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
  checkIfKeySerialNumberIsValid: (
    keyId: number,
    serialNumber: string,
    id: number
  ) => boolean;
}

const AssignKeySerial = (props: IProps) => {
  const assignment =
    props.selectedKeySerial && props.selectedKeySerial.keySerialAssignment;
  const [date, setDate] = useState<Date>(
    !!assignment
      ? new Date(assignment.expiresAt)
      : addYears(startOfDay(new Date()), 3)
  );
  const [keySerial, setKeySerial] = useState<IKeySerial>(
    props.selectedKeySerial
  );
  const [person, setPerson] = useState<IPerson>(
    !!assignment ? assignment.person : props.person
  );
  const [error, setError] = useState<IValidationError>({
    message: '',
    path: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      // for if they select person before key serial, don't show error but disable button
      if (!keySerial) {
        setValidState(false);
        return;
      }

      const checkIfKeySerialNumberIsValid = props.checkIfKeySerialNumberIsValid;
      const error = yupAssetValidation(
        keySerialSchema,
        keySerial,
        {
          context: { checkIfKeySerialNumberIsValid }
        },
        { date: date, person: person }
      );
      setError(error);
      setValidState(error.message === '');
    };

    validateState();
  }, [date, keySerial, person, props.checkIfKeySerialNumberIsValid]);

  const { isModalOpen, selectedKey } = props;

  const changeProperty = (property: string, value: string) => {
    setKeySerial({ ...keySerial, [property]: value });
  };

  const selectKey = (keyInfo: IKeyInfo) => {
    setKeySerial({ ...keySerial, key: keyInfo.key });
  };

  const deselectKey = () => {
    setKeySerial({ ...keySerial, key: null });
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
    setError({ message: '', path: '' });
    setKeySerial(null);
    setPerson(null);
    setSubmitting(false);
    setValidState(false);
    props.closeModal();
  };

  // assign the selected key even if we have to create it
  const assignSelected = async () => {
    if (!validState || submitting) {
      return;
    }

    setSubmitting(true);
    const personData = props.person ? props.person : person;

    try {
      await props.onCreate(personData, keySerial, format(date, 'MM/dd/yyyy'));
    } catch (err) {
      setSubmitting(false);
      return;
    }

    closeModal();
  };

  const onSelected = (keySerial: IKeySerial) => {
    setKeySerial(keySerial);
    setError({ message: '', path: '' });
  };

  const onDeselected = () => {
    setKeySerial(null);
    setError({ message: '', path: '' });
  };

  const onSelectPerson = (person: IPerson) => {
    setPerson(person);
  };

  const changeDate = (newDate: Date) => {
    setDate(startOfDay(new Date(newDate)));
    setError({ message: '', path: '' });
  };

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={confirmClose}
      className='keys-color'
    >
      <ModalHeading>{props.selectedKeySerial || props.person
            ? 'Assign Key Serial'
            : 'Add Key Serial'}</ModalHeading>
      <ModalBody>
        <div className='space-y-6'>
          <Form className='space-y-6'>
            <AssignPerson
              disabled={
                !!props.person ||
                (!!props.selectedKeySerial &&
                  !!props.selectedKeySerial.keySerialAssignment)
              }
              isRequired={keySerial && keySerial.id !== 0 && !person}
              // disable if we are on person page or updating
              label='Assign Person'
              person={person}
              onSelect={onSelectPerson}
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
            {!keySerial && (
              <div className='space-y-2'>
                <SearchKeySerial
                  selectedKey={selectedKey}
                  selectedKeySerial={keySerial}
                  onSelect={onSelected}
                  onDeselect={onDeselected}
                  openDetailsModal={props.openDetailsModal}
                />
              </div>
            )}
            {keySerial &&
            !keySerial.id && ( // if we are creating a new serial, edit properties
                <div>
                  <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
                    <h3 className="text-lg font-semibold">Create New Serial</h3>
                    <AssetActions>
                      <Button color='link' onClick={onDeselected}>
                        Clear{' '}
                        <XMarkIcon data-icon="x-mark" className='hero-icon size-4' aria-hidden='true' />
                      </Button>
                    </AssetActions>
                  </div>
                  {!keySerial.key && (
                    <div>
                      <label>Choose a key to create a new serial for</label>
                      <SearchKeys
                        onSelect={selectKey}
                        onDeselect={deselectKey}
                        allowNew={false}
                      />
                    </div>
                  )}
                  {!!keySerial.key && (
                    <KeySerialEditValues
                      person={props.person}
                      keySerial={keySerial}
                      changeProperty={changeProperty}
                      disableEditing={false}
                      statusList={props.statusList}
                      goToKeyDetails={props.goToKeyDetails}
                      error={error}
                    />
                  )}
                </div>
              )}
            {keySerial && !!keySerial.id && (
              <div>
                <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
                  <h3 className="text-lg font-semibold">Assign Existing Serial</h3>
                  <AssetActions>
                    <Button color='link' onClick={onDeselected}>
                      Clear{' '}
                      <XMarkIcon data-icon="x-mark" className='hero-icon size-4' aria-hidden='true' />
                    </Button>
                  </AssetActions>
                </div>

                <KeySerialEditValues
                  keySerial={keySerial}
                  person={props.person}
                  disableEditing={true}
                  openEditModal={props.openEditModal}
                  statusList={props.statusList}
                  goToKeyDetails={props.goToKeyDetails}
                />
              </div>
            )}
          </Form>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='asset'
          onClick={assignSelected}
          disabled={!validState || submitting}
        >
          Assign {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};

export default AssignKeySerial;
