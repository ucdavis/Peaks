import * as React from 'react';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../models/Access';
import HistoryContainer from '../History/HistoryContainer';
import AccessEditValues from './AccessEditValues';
import AccessAssignmentValues from './AccessAssignmentValues';

interface IProps {
  isModalOpen: boolean;
  selectedAccessAssignment: IAccessAssignment;
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
  const context = useContext(Context);
  const { selectedAccessAssignment } = props;

  useEffect(() => {
    if (!props.selectedAccessAssignment) {
      return;
    }
    // fetchDetails(props.selectedAccessAssignment.id);
  }, []);

  if (!selectedAccessAssignment) {
    return null;
  }

  const fetchDetails = async (id: number) => {
    const url = `/api/${context.team.slug}/accessAssignments/details/${id}`;
    let accessAssignment: IAccessAssignment = null;
    try {
      accessAssignment = await context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The access assignment you were trying to view could not be found. It may have been deleted.'
        );
        props.updateSelectedAccessAssignment(null, id);
        props.closeModal();
      } else {
        toast.error(
          'Error fetching access assignment details. Please refresh the page to try again.'
        );
      }
      return;
    }
    props.updateSelectedAccessAssignment(accessAssignment);
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
            Details for {selectedAccessAssignment.access.name}
            {selectedAccessAssignment.person.name}
          </h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <AccessEditValues
            selectedAccess={selectedAccessAssignment.access}
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
