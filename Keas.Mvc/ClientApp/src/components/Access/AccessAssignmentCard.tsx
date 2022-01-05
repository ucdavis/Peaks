import * as React from 'react';
import { Button } from 'reactstrap';

interface IProps {
  disableEditing?: boolean;
  openAssignModal?: () => void;
}

const assignmentView: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props: React.PropsWithChildren<IProps>) => {
  return (
    <div className='card access-color'>
      <div className='card-header-access'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-address-card fa-xs' /> Assignments
          </h2>
          {!props.disableEditing && (
            <Button color='link' onClick={props.openAssignModal}>
              <i className='fas fa-plus fa-sm' aria-hidden='true' /> Assign
              Access
            </Button>
          )}
        </div>
      </div>
      <div className='card-content'>
        {props.children}
      </div>
    </div>
  );
};

export default assignmentView;
