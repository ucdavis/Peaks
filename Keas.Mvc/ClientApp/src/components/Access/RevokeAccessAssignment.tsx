import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessEditValues from './AccessEditValues';
import AccessAssignmentEditValues from './AccessAssignmentValues';

interface IProps {
  selectedAccessAssignment: IAccessAssignment;
  isModalOpen: boolean;
  closeModal: () => void;
  openEditModal: (access: IAccess) => void;
  openUpdateModal: (accessAssignment: IAccessAssignment) => void;
  onRevoke: (accessAssignment: IAccessAssignment) => void;
  updateSelectedAccessAssignment: (accessAssignment: IAccessAssignment) => void;
  goToAccessDetails?: (access: IAccess) => void; // will only be supplied from person container
}

const RevokeAccessAssignment = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { selectedAccessAssignment } = props;

  if (!selectedAccessAssignment) {
    return null;
  }

  const revokeAccessAssignment = async () => {
    if (!isValidToRevoke()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.onRevoke(props.selectedAccessAssignment);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    props.closeModal();
  };

  const isValidToRevoke = () => {
    return !!props.selectedAccessAssignment;
  };

  return (
    <div>
      <Modal
        isOpen={props.isModalOpen}
        toggle={props.closeModal}
        size='lg'
        className='access-color'
        scrollable={true}
      >
        <div className='modal-header row justify-content-between'>
          <h2>Revoke Access for {selectedAccessAssignment.person.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <AccessEditValues
            selectedAccess={selectedAccessAssignment.access}
            disableEditing={true}
            openEditModal={props.openEditModal}
            goToAccessDetails={props.goToAccessDetails}
          />
          <AccessAssignmentEditValues
            selectedAccessAssignment={selectedAccessAssignment}
            openUpdateModal={props.openUpdateModal}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => revokeAccessAssignment()}
            disabled={!isValidToRevoke() || submitting}
          >
            Revoke {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeAccessAssignment;
