import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessEditValues from './AccessEditValues';
import AccessAssignmentValues from './AccessAssignmentValues';
interface IProps {
  isModalOpen: boolean;
  closeModal: () => void;
  openEditModal?: (access: IAccess) => void;
  openUpdateModal: (accessAssignment: IAccessAssignment) => void;
  revokeAccessAssignment: (accessAssignment: IAccessAssignment) => void;
  selectedAccessAssignment: IAccessAssignment;
}

const RevokeAccess = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!props.selectedAccessAssignment || !props.selectedAccessAssignment) {
    return null;
  }
  const revokeAccess = async () => {
    if (!isValidToRevoke()) {
      return;
    }
    setSubmitting(true);
    try {
      await props.revokeAccessAssignment(props.selectedAccessAssignment);
    } catch (err) {
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    props.closeModal();
  };

  const isValidToRevoke = () => {
    return props.selectedAccessAssignment !== null;
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
          <h2>
            Revoke {props.selectedAccessAssignment.access.name} from{' '}
            {props.selectedAccessAssignment.person.name}
          </h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <AccessEditValues
            selectedAccess={props.selectedAccessAssignment.access}
            disableEditing={true}
          />
          <AccessAssignmentValues
            selectedAccessAssignment={props.selectedAccessAssignment}
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
            Revoke {submitting && <i className='fas fa-circle-notch fa-spin' />}
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevokeAccess;
