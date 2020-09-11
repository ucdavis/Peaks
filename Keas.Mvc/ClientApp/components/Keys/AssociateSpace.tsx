import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
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
    validateState();
  }, [selectedKeyInfo, selectedSpace]);

  const renderSearchSpace = () => {
    const { selectedSpace } = props;

    // we're being given a specific key to readonly
    if (selectedSpace) {
      return (
        <div className='form-group'>
          <label>Space to associate with:</label>
          <input
            className='form-control'
            value={`${selectedSpace.roomNumber} ${selectedSpace.bldgName}`}
            readOnly={true}
          />
        </div>
      );
    }

    return (
      <div className='form-group'>
        <label>Space to associate with:</label>
        <SearchSpaces onSelect={onSelectSpace} />
      </div>
    );
  };

  const renderSearchKey = () => {
    // we're being given a specific key to readonly
    if (selectedKeyInfo) {
      return (
        <div className='form-group'>
          <label>Key to associate with:</label>
          <input
            className='form-control'
            value={`${selectedKeyInfo.key.name} - ${selectedKeyInfo.key.code}`}
            readOnly={true}
          />
        </div>
      );
    }

    return (
      <div className='form-group'>
        <label>Pick an key to associate</label>
        <SearchKeys
          onSelect={onSelectedKeyInfo}
          onDeselect={onDeselected}
          allowNew={false}
        />
      </div>
    );
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
    setSelectedKeyInfo({ ...selectedKeyInfo, [property]: value });
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
      selectedKeyInfo.key.keyXSpaces &&
      selectedKeyInfo.key.keyXSpaces.length
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

  return (
    <Modal
      isOpen={props.isModalOpen}
      toggle={closeModal}
      size='lg'
      className='keys-color'
    >
      <div className='modal-header row justify-content-between'>
        <h2>Assign Key</h2>
        <Button color='link' onClick={closeModal}>
          <i className='fas fa-times fa-lg' />
        </Button>
      </div>
      <ModalBody>
        {renderSearchSpace()}

        {renderSearchKey()}

        {renderCreateKey()}
      </ModalBody>
      <ModalFooter className='justify-content-between'>
        <span className='text-danger'>{error}</span>
        <Button
          color='primary'
          onClick={assignSelected}
          disabled={!validState || submitting}
        >
          Go!
          {submitting && <i className='fas fa-circle-notch fa-spin ml-2' />}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssociateSpace;
