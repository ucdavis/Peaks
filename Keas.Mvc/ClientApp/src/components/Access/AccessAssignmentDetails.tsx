import * as React from 'react';
import { Button, Modal, ModalBody } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessEditValues from './AccessEditValues';
import AccessAssignmentValues from './AccessAssignmentValues';

interface IProps {
  isModalOpen: boolean;
  selectedAccessAssignment: IAccessAssignment;
  selectedAccess: IAccess;
  closeModal: () => void;
  openEditModal: (access: IAccess) => void;
  openUpdateModal: (accessAssignment: IAccessAssignment) => void;
  updateSelectedAccessAssignment: (
    accessAssignment: IAccessAssignment,
    id?: number
  ) => void;
  goToAccessDetails?: (access: IAccess) => void; // will only be supplied from person container
}

const AccessAssignmentDetails = (props: IProps) => {
  const { selectedAccessAssignment, selectedAccess } = props;
  if (!selectedAccessAssignment) {
    return null;
  }

  return (
    <div>
      <Modal
        isOpen={props.isModalOpen}
        toggle={props.closeModal}
        size='lg'
        className='access-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Details for {selectedAccess.name} Assignment</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <AccessEditValues
            selectedAccess={selectedAccess}
            disableEditing={true}
            goToAccessDetails={props.goToAccessDetails}
          />
          <AccessAssignmentValues
            selectedAccessAssignment={selectedAccessAssignment}
            openUpdateModal={props.openUpdateModal}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AccessAssignmentDetails;
