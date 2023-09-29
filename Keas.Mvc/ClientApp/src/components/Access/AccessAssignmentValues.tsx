import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedAccessAssignment: IAccessAssignment;
  openUpdateModal: (access: IAccessAssignment) => void;
}

const AccessAssignmentValues = (props: IProps) => {
  if (!props.selectedAccessAssignment) {
    return null;
  }

  return (
    <div>
      <div className='row justify-content-between mt-5'>
        <h3>Assignment Details</h3>
        <Button
          color='link'
          onClick={() => props.openUpdateModal(props.selectedAccessAssignment)}
        >
          <i className='fas fa-edit fa-xs' />{' '}
          {!!props.selectedAccessAssignment
            ? 'Update Assignment'
            : 'Assign Equipment'}
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
              !!props.selectedAccessAssignment
                ? props.selectedAccessAssignment.person.name
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
              !!props.selectedAccessAssignment
                ? DateUtil.formatExpiration(
                    props.selectedAccessAssignment.expiresAt
                  )
                : ''
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AccessAssignmentValues;
