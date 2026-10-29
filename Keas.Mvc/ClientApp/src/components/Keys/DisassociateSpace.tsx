import { DisplayField } from '../Shared/AssetSummary';
import { Modal, ModalBody, ModalFooter, ModalHeading } from '../Shared/AppModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button } from 'reactstrap';
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
        className='keys-color'
      >
        <ModalHeading>Disassociate Key and Space</ModalHeading>
        <ModalBody>
          <h2 className="text-xl font-semibold">Key</h2>
          <KeyEditValues
            selectedKey={props.selectedKeyInfo.key}
            disableEditing={true}
          />
          <h2 className="text-xl font-semibold">Space</h2>
          <div>
            <dl><DisplayField label='Room Number and Building'>{props.selectedSpace.roomNumber +
                  ' ' +
                  props.selectedSpace.bldgName}</DisplayField></dl>
            <dl><DisplayField label='Room Name'>{props.selectedSpace.roomName
                    ? props.selectedSpace.roomName
                    : ''}</DisplayField></dl>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='error'
            onClick={disassociateKeyAndSpace}
            disabled={submitting}
          >
            Remove association
            {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin ml-2' />}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  return <div>{renderModal()}</div>;
};

export default DisassociateSpace;
