import { Modal, ModalBody, ModalHeading } from '../Shared/AppModal';
import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessEditValues from './AccessEditValues';
import AccessAssignmentValues from './AccessAssignmentValues';

interface IProps {
  isModalOpen: boolean;
  selectedAccessAssignment: IAccessAssignment;
  selectedAccess: IAccess;
  closeModal: () => void;
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
        className='access-color'
      >
        <ModalHeading>Details for {selectedAccess.name} Assignment</ModalHeading>
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
