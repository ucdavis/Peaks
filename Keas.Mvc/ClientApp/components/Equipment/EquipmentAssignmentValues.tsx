import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedEquipment: IEquipment;
  openUpdateModal: (equipment: IEquipment) => void;
}

const EquipmentAssignmentValues = (props: IProps) => {
  if (!props.selectedEquipment || !props.selectedEquipment.assignment) {
    return null;
  }
  
  return (
    <div>
      <div className='row justify-content-between mt-5'>
        <h3>Assignment Details</h3>
        <Button
          color='link'
          onClick={() => props.openUpdateModal(props.selectedEquipment)}
        >
          <i className='fas fa-edit fa-xs' /> Update Assignment
        </Button>
      </div>
      <div className='wrapperasset'>
        <div className='form-group'>
          <label>Assigned To</label>
          <input
            type='text'
            className='form-control'
            disabled={true}
            value={props.selectedEquipment.assignment.person.name}
          />
        </div>
        <div className='form-group'>
          <label>Expires at</label>
          <input
            type='text'
            className='form-control'
            disabled={true}
            value={DateUtil.formatExpiration(
              props.selectedEquipment.assignment.expiresAt
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default EquipmentAssignmentValues;
