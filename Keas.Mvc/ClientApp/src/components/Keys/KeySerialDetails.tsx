import { XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';
import HistoryContainer from '../History/HistoryContainer';
import KeySerialAssignmentValues from './KeySerialAssignmentValues';
import KeySerialEditValues from './KeySerialEditValues';

interface IProps {
  isModalOpen: boolean;
  selectedKeySerial: IKeySerial;
  closeModal: () => void;
  openEditModal: (keySerial: IKeySerial) => void;
  openUpdateModal: (keySerial: IKeySerial) => void;
  updateSelectedKeySerial: (keySerial: IKeySerial, id?: number) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
}

const KeySerialDetails = (props: IProps) => {
  const context = useContext(Context);
  const { selectedKeySerial } = props;
  const keySerialId = selectedKeySerial?.id;

  useEffect(() => {
    if (!keySerialId) {
      return;
    }
    fetchDetails(selectedKeySerial.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keySerialId, context]);

  if (!selectedKeySerial) {
    return null;
  }

  const fetchDetails = async (id: number) => {
    const url = `/api/${context.team.slug}/keySerials/details/${id}`;
    let keySerial: IKeySerial = null;
    try {
      keySerial = await context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The key serial you were trying to view could not be found. It may have been deleted.'
        );
        props.updateSelectedKeySerial(null, id);
        props.closeModal();
      } else {
        toast.error(
          'Error fetching key serial details. Please refresh the page to try again.'
        );
      }
      return;
    }
    props.updateSelectedKeySerial(keySerial);
  };

  return (
    <div>
      <Modal
        isOpen={props.isModalOpen}
        toggle={props.closeModal}
        size='lg'
        className='keys-color'
      >
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">
            Details for {selectedKeySerial.key.code} {selectedKeySerial.number}
          </h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>
        <ModalBody className='p-6'>
          <KeySerialEditValues
            keySerial={selectedKeySerial}
            disableEditing={true}
            openEditModal={props.openEditModal}
            goToKeyDetails={props.goToKeyDetails}
          />
          <KeySerialAssignmentValues
            selectedKeySerial={selectedKeySerial}
            openUpdateModal={props.openUpdateModal}
          />
          <HistoryContainer controller='keyserials' id={selectedKeySerial.id} />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default KeySerialDetails;
