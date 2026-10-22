import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessEditValues from './AccessEditValues';
import AccessAssignmentValues from './AccessAssignmentValues';
interface IProps {
  isModalOpen: boolean;
  closeModal: () => void;
  openUpdateModal: (accessAssignment: IAccessAssignment) => void;
  revokeAccessAssignment: (accessAssignment: IAccessAssignment) => void;
  selectedAccessAssignment: IAccessAssignment;
  selectedAccess: IAccess;
}

const RevokeAccess = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { selectedAccess, selectedAccessAssignment } = props;

  if (!selectedAccessAssignment || !selectedAccessAssignment) {
    return null;
  }
  const revokeAccess = async () => {
    if (!isValidToRevoke()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.revokeAccessAssignment(selectedAccessAssignment);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    props.closeModal();
  };

  const isValidToRevoke = () => {
    return selectedAccessAssignment !== null;
  };

  return (
    <div>
      <Modal
        isOpen={props.isModalOpen}
        toggle={props.closeModal}
        size='lg'
        className='access-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>
            Revoke {selectedAccess.name} from{' '}
            {selectedAccessAssignment.person.name}
          </h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>

        <ModalBody>
          <AccessEditValues
            selectedAccess={selectedAccess}
            disableEditing={true}
          />
          <AccessAssignmentValues
            selectedAccessAssignment={selectedAccessAssignment}
            openUpdateModal={props.openUpdateModal}
          />
          {!isValidToRevoke() && (
            <div>The access you have chosen does not have an assignment</div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => revokeAccess()}
            disabled={!isValidToRevoke() || submitting}
          >
            Revoke {submitting && <ArrowPathIcon data-icon="arrow-path" className='hero-icon size-5 animate-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeAccess;
