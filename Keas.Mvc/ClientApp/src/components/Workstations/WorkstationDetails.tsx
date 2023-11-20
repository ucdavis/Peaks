import * as React from 'react';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { Context } from '../../Context';
import { IWorkstation } from '../../models/Workstations';
import HistoryContainer from '../History/HistoryContainer';
import WorkstationAssignmentValues from './WorkstationAssignmentValues';
import WorkstationEditValues from './WorkstationEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  openEditModal: (workstation: IWorkstation) => void;
  openUpdateModal: (workstation: IWorkstation) => void;
  selectedWorkstation: IWorkstation;
  updateSelectedWorkstation: (workstation: IWorkstation, id?: number) => void;
}

const WorkstationDetails = (props: IProps) => {
  const context = useContext(Context);
  const { selectedWorkstation: workstation } = props;
  const workstationId = workstation?.id;

  useEffect(() => {
    if (!workstationId) {
      return;
    }
    const fetchDetails = async (id: number) => {
      const url = `/api/${context.team.slug}/workstations/details/${id}`;
      let workstation: IWorkstation = null;
      try {
        workstation = await context.fetch(url);
      } catch (err) {
        if (err.message === 'Not Found') {
          toast.error(
            'The workstation you were trying to view could not be found. It may have been deleted.'
          );
          props.updateSelectedWorkstation(null, id);
          props.closeModal();
        } else {
          toast.error(
            'Error fetching workstation details. Please refresh the page to try again.'
          );
        }
        return;
      }
      props.updateSelectedWorkstation(workstation);
    };

    fetchDetails(workstationId);
    // it wants us to add props.closeModal and props.updateSelectedWorkstation to the dependency array, but that causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workstationId, context]);

  if (!props.selectedWorkstation) {
    return null;
  }
  return (
    <div>
      <Modal
        isOpen={props.modal}
        toggle={props.closeModal}
        size='lg'
        className='spaces-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Details for {workstation.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>
        <ModalBody>
          <WorkstationEditValues
            selectedWorkstation={workstation}
            disableEditing={true}
            disableSpaceEditing={true}
            openEditModal={props.openEditModal}
          />
          <WorkstationAssignmentValues
            selectedWorkstation={workstation}
            openUpdateModal={props.openUpdateModal}
          />
          <HistoryContainer controller='workstations' id={workstation.id} />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default WorkstationDetails;
