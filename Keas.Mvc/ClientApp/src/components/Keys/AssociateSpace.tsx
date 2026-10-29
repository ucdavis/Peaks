import { DisplayField } from '../Shared/AssetSummary';
import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { IKeyInfo } from '../../models/Keys';
import { ISpace } from '../../models/Spaces';
import SearchSpaces from '../Spaces/SearchSpaces';
import KeyEditValues from './KeyEditValues';
import SearchKeys from './SearchKeys';

interface IProps {
  onAssign: (space: ISpace, keyInfo: IKeyInfo) => void;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
  searchableTags: string[];
  selectedKeyInfo?: IKeyInfo;
  selectedSpace?: ISpace;
}

const AssociateSpace = (props: IProps) => {
  const [error, setError] = useState<string>('');
  const [selectedKeyInfo, setSelectedKeyInfo] = useState<IKeyInfo>(
    props.selectedKeyInfo
  );
  const [selectedSpace, setSelectedSpace] = useState<ISpace>(
    props.selectedSpace
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validState, setValidState] = useState<boolean>(false);

  useEffect(() => {
    const validateState = () => {
      let valid = true;
      let error = '';

      // ensure both values are set
      if (!selectedKeyInfo) {
        valid = false;
      } else if (error !== '') {
        valid = false;
      }

      // check for existing association
      if (
        selectedKeyInfo?.key.keyXSpaces &&
        selectedKeyInfo?.key.keyXSpaces.length
      ) {
        const isDuplicate = selectedKeyInfo.key.keyXSpaces.some(
          x => x.spaceId === selectedSpace.id
        );
        if (isDuplicate) {
          valid = false;
          error = 'This space and key are already associated.';
        }
      }

      setValidState(valid);
      setError(error);
    };
    validateState();
  }, [selectedKeyInfo, selectedSpace]);

  const renderSearchSpace = () => {
    const { selectedSpace } = props;
    if (selectedSpace) {
      return <dl><DisplayField label='Space to associate with'>{`${selectedSpace.roomNumber} ${selectedSpace.bldgName}`}</DisplayField></dl>;
    }
    return <div className='space-y-2'>
      <label className='block text-sm font-semibold'>Space to associate with:</label>
      <SearchSpaces onSelect={onSelectSpace} />
    </div>;
  };

  const renderSearchKey = () => {
    if (selectedKeyInfo) {
      return <dl><DisplayField label='Key to associate with'>{`${selectedKeyInfo.key.name} - ${selectedKeyInfo.key.code}`}</DisplayField></dl>;
    }
    return <div className='space-y-2'>
      <label className='block text-sm font-semibold'>Pick a key to associate</label>
      <SearchKeys onSelect={onSelectedKeyInfo} onDeselect={onDeselected} allowNew={false} />
    </div>;
  };

  const renderCreateKey = () => {
    const { searchableTags } = props;

    if (!selectedKeyInfo || selectedKeyInfo.id > 0) {
      return;
    }

    return (
      <KeyEditValues
        selectedKey={selectedKeyInfo.key}
        changeProperty={changeProperty}
        disableEditing={false}
        searchableTags={searchableTags}
      />
    );
  };

  const changeProperty = (property: string, value: string) => {
    setSelectedKeyInfo({
      ...selectedKeyInfo,
      key: {
        ...selectedKeyInfo.key,
        [property]: value
      }
    });
  };

  // default everything out on close
  const closeModal = () => {
    const { selectedKeyInfo, selectedSpace } = props;
    setError('');
    setSelectedKeyInfo(selectedKeyInfo);
    setSelectedSpace(selectedSpace);
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

    try {
      await props.onAssign(selectedSpace, selectedKeyInfo);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  const onSelectedKeyInfo = (keyInfo: IKeyInfo) => {
    setSelectedKeyInfo(keyInfo);
    setError('');
  };

  const onDeselected = () => {
    setSelectedKeyInfo(null);
    setError('');
  };

  const onSelectSpace = (space: ISpace) => {
    setSelectedSpace(space);
  };

  return (
    <Modal
      isOpen={props.isModalOpen}
      toggle={closeModal}
      className='keys-color'
    >
      <ModalHeading>Assign Key</ModalHeading>
      <ModalBody>
        {renderSearchSpace()}

        {renderSearchKey()}

        {renderCreateKey()}
      </ModalBody>
      <ModalFooter>
        <span className='text-danger'>{error}</span>
        <Button
          color='asset'
          onClick={assignSelected}
          disabled={!validState || submitting}
        >
          Assign
          {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin ml-2' />}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssociateSpace;
