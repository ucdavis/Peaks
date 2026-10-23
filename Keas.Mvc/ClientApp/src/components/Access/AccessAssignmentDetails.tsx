import { XMarkIcon } from '@heroicons/react/24/outline';
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
        <div className='flex flex-wrap items-start justify-between gap-4 p-6 pb-3'>
          <h2 className="text-xl font-semibold">Details for {selectedAccess.name} Assignment</h2>
          <Button color='link' onClick={props.closeModal}>
            <XMarkIcon data-icon="x-mark" className='hero-icon size-6' />
          </Button>
        </div>
        <ModalBody className='p-6'>
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
