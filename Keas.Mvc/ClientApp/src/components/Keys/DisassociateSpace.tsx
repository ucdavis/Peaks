import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IKeyInfo } from '../../models/Keys';
import { ISpace } from '../../models/Spaces';
import KeyEditValues from './KeyEditValues';

interface IProps {
  onDisassociate: (key: IKeyInfo, space: ISpace) => void;
  closeModal: () => void;

  isModalOpen: boolean;
  selectedKeyInfo: IKeyInfo;
  selectedSpace: ISpace;
}

const DisassociateSpace = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  // default everything out on close
  const disassociateKeyAndSpace = async () => {
    setSubmitting(false);
    try {
      await props.onDisassociate(props.selectedKeyInfo, props.selectedSpace);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    closeModal();
  };

  const closeModal = () => {
    setSubmitting(false);
    props.closeModal();
  };

  const renderModal = () => {
    if (!props.selectedKeyInfo || !props.selectedSpace) {
      return;
    }

    return (
      <Modal
        isOpen={props.isModalOpen}
        toggle={closeModal}
        size='lg'
        className='keys-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Disassociate Key and Space</h2>
          <Button color='link' onClick={closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>
        <ModalBody className='p-6'>
          <h2 className="text-xl font-semibold">Key</h2>
          <KeyEditValues
            selectedKey={props.selectedKeyInfo.key}
            disableEditing={true}
          />
          <h2 className="text-xl font-semibold">Space</h2>
          <div>
            <div className='form-group'>
              <label>Room Number and Building</label>
              <input
                className='form-control'
                disabled={true}
                value={
                  props.selectedSpace.roomNumber +
                  ' ' +
                  props.selectedSpace.bldgName
                }
              />
            </div>
            <div className='form-group'>
              <label>Room Name</label>
              <input
                className='form-control'
                disabled={true}
                value={
                  props.selectedSpace.roomName
                    ? props.selectedSpace.roomName
                    : ''
                }
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className='flex flex-wrap items-center justify-end gap-2 p-6 pt-0'>
          <Button
            color='error'
            onClick={disassociateKeyAndSpace}
            disabled={submitting}
          >
            Go!
            {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin ml-2' />}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  return <div>{renderModal()}</div>;
};

export default DisassociateSpace;
