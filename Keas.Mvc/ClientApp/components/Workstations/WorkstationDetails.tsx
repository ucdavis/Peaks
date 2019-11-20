import * as React from 'react';
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

export default class WorkstationDetails extends React.Component<IProps, {}> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  public componentDidMount() {
    if (!this.props.selectedWorkstation) {
      return;
    }
    this._fetchDetails(this.props.selectedWorkstation.id);
  }

  public render() {
    if (!this.props.selectedWorkstation) {
      return null;
    }
    const workstation = this.props.selectedWorkstation;
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.closeModal}
          size='lg'
          className='spaces-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Details for {workstation.name}</h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>
          <ModalBody>
            <WorkstationEditValues
              selectedWorkstation={workstation}
              disableEditing={true}
              disableSpaceEditing={true}
              openEditModal={this.props.openEditModal}
            />
            <WorkstationAssignmentValues
              selectedWorkstation={workstation}
              openUpdateModal={this.props.openUpdateModal}
            />
            <HistoryContainer controller='workstations' id={workstation.id} />
          </ModalBody>
        </Modal>
      </div>
    );
  }

  private _fetchDetails = async (id: number) => {
    const url = `/api/${this.context.team.slug}/workstations/details/${id}`;
    let workstation: IWorkstation = null;
    try {
      workstation = await this.context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The workstation you were trying to view could not be found. It may have been deleted.'
        );
        this.props.updateSelectedWorkstation(null, id);
        this.props.closeModal();
      } else {
        toast.error(
          'Error fetching workstation details. Please refresh the page to try again.'
        );
      }
      return;
    }
    this.props.updateSelectedWorkstation(workstation);
  };
}
