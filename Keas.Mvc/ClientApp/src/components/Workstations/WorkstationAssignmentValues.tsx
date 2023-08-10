import * as React from 'react';
import { Button } from 'reactstrap';
import { IWorkstation } from '../../models/Workstations';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedWorkstation: IWorkstation;
  openUpdateModal: (workstation: IWorkstation) => void;
}

const WorkstationAssignmentValues = (props: IProps) => {
  if (!props.selectedWorkstation) {
    return null;
  }

  return (
    <div>
      <div className='row justify-content-between mt-5'>
        <h3>Assignment Details</h3>
        <Button
          color='link'
          onClick={() => props.openUpdateModal(props.selectedWorkstation)}
        >
          <i className='fas fa-edit fa-xs' />{' '}
          {!!props.selectedWorkstation.assignment
            ? 'Update Assignment'
            : 'Assign Workstation'}
        </Button>
      </div>

      <div className='wrapperasset'>
        <div className='form-group'>
          <label>Assigned To</label>
          <input
            type='text'
            className='form-control'
            disabled={true}
            value={
              !!props.selectedWorkstation.assignment
                ? props.selectedWorkstation.assignment.person.name
                : ''
            }
          />
        </div>
        <div className='form-group'>
          <label>Expires at</label>
          <input
            type='text'
            className='form-control'
            disabled={true}
            value={
              !!props.selectedWorkstation.assignment
                ? DateUtil.formatExpiration(
                    props.selectedWorkstation.assignment.expiresAt
                  )
                : ''
            }
          />
        </div>
      </div>
    </div>
  );
};

export default WorkstationAssignmentValues;
