import * as React from 'react';

interface IProps {
  viewName: string;
}

const Denied = (props: IProps) => {
  return (
    <div className='card'>
      <div className='card-body'>
        <h4 className='card-title'>{props.viewName}</h4>
        <div>You do not have permission to see {props.viewName}.</div>
      </div>
    </div>
  );
};

export default Denied;
