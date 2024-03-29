﻿import * as React from 'react';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { Context } from '../../Context';
import { IEquipment } from '../../models/Equipment';
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

const EquipmentDetails = (props: IProps) => {
  const context = useContext(Context);
  const { selectedEquipment } = props;
  const equipmentId = selectedEquipment?.id;

  useEffect(() => {
    if (!equipmentId) {
      return;
    }
    const fetchDetails = async (id: number) => {
      const url = `/api/${context.team.slug}/equipment/details/${id}`;
      let equipment: IEquipment = null;
      try {
        equipment = await context.fetch(url);
      } catch (err) {
        if (err.message === 'Not Found') {
          toast.error(
            'The equipment you were trying to view could not be found. It may have been deleted.'
          );
          props.updateSelectedEquipment(null, id);
          props.closeModal();
        } else {
          toast.error(
            'Error fetching equipment details. Please refresh the page to try again.'
          );
        }
        return;
      }
      props.updateSelectedEquipment(equipment);
    };

    fetchDetails(equipmentId);
    // it wants us to add props.closeModal and props.updateSelectedEquipment to the dependency array, but that causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentId, context]);

  if (!selectedEquipment) {
    return null;
  }

  const equipment = selectedEquipment;

  return (
    <div>
      <Modal
        isOpen={props.modal}
        toggle={props.closeModal}
        size='lg'
        className='equipment-color'
      >
        <div className='modal-header row justify-content-between'>
          <h2>Details for {equipment.name}</h2>
          <Button color='link' onClick={props.closeModal}>
            <i className='fas fa-times fa-lg' />
          </Button>
        </div>

        <ModalBody>
          <EquipmentEditValues
            selectedEquipment={equipment}
            disableEditing={true}
            openEditModal={props.openEditModal}
          />
          <EquipmentAssignmentValues
            selectedEquipment={equipment}
            openUpdateModal={props.openUpdateModal}
          />
          <HistoryContainer controller='equipment' id={equipment.id} />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default EquipmentDetails;
