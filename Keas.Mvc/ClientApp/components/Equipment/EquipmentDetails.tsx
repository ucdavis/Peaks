import * as PropTypes from 'prop-types';
import * as React from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { AppContext, IEquipment } from '../../Types';
import HistoryContainer from '../History/HistoryContainer';
import EquipmentAssignmentValues from './EquipmentAssignmentValues';
import EquipmentEditValues from './EquipmentEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  openEditModal: (equipment: IEquipment) => void;
  openUpdateModal: (equipment: IEquipment) => void;
  selectedEquipment: IEquipment;
  updateSelectedEquipment: (equipment: IEquipment, id?: number) => void;
}

export default class EquipmentDetails extends React.Component<IProps, {}> {
  public static contextTypes = {
    fetch: PropTypes.func,
    team: PropTypes.object
  };
  public context: AppContext;

  public componentDidMount() {
    if (!this.props.selectedEquipment) {
      return;
    }
    this._fetchDetails(this.props.selectedEquipment.id);
  }

  public render() {
    if (!this.props.selectedEquipment) {
      return null;
    }
    const equipment = this.props.selectedEquipment;
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.closeModal}
          size='lg'
          className='equipment-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Details for {equipment.name}</h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>

          <ModalBody>
            <EquipmentEditValues
              selectedEquipment={equipment}
              disableEditing={true}
              openEditModal={this.props.openEditModal}
            />
            <EquipmentAssignmentValues
              selectedEquipment={equipment}
              openUpdateModal={this.props.openUpdateModal}
            />
            <HistoryContainer controller='equipment' id={equipment.id} />
          </ModalBody>
        </Modal>
      </div>
    );
  }

  private _fetchDetails = async (id: number) => {
    const url = `/api/${this.context.team.slug}/equipment/details/${id}`;
    let equipment: IEquipment = null;
    try {
      equipment = await this.context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The equipment you were trying to view could not be found. It may have been deleted.'
        );
        this.props.updateSelectedEquipment(null, id);
        this.props.closeModal();
      } else {
        toast.error(
          'Error fetching equipment details. Please refresh the page to try again.'
        );
      }
      return;
    }
    this.props.updateSelectedEquipment(equipment);
  };
}
