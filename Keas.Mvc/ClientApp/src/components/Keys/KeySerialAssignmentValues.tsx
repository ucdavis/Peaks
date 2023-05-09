import * as React from 'react';
import { Button } from 'reactstrap';
import { IKeySerial } from '../../models/KeySerials';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedKeySerial: IKeySerial;
  openUpdateModal: (keySerial: IKeySerial) => void;
}

const KeySerialAssignmentValues = (props: IProps) => {
  if (
    !props.selectedKeySerial ||
    !props.selectedKeySerial.keySerialAssignment
  ) {
    return null;
  }

  return (
    <div>
      <div className='row justify-content-between mt-5'>
        <h3>Assignment Details</h3>
        <Button
          color='link'
          onClick={() => props.openUpdateModal(props.selectedKeySerial)}
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
            value={props.selectedKeySerial.keySerialAssignment.person.name}
          />
        </div>
        <div className='form-group'>
          <label>Expires at</label>
          <input
            type='text'
            className='form-control'
            disabled={true}
            value={DateUtil.formatExpiration(
              props.selectedKeySerial.keySerialAssignment.expiresAt
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default KeySerialAssignmentValues;
