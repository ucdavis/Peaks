import * as React from 'react';
import { ISpace } from '../../models/Spaces';

interface IProps {
  space: ISpace;
  tags: string;
}

const SpacesDetailContainer = (props: IProps) => {
  return (
    <div>
      <div>
        <h2 className='card-title'>
          {props.space.roomNumber} {props.space.bldgName}
        </h2>
        <div className='card-text'>
          {props.space.roomCategoryName && (
            <div>{props.space.roomCategoryName}</div>
          )}
          {props.space.roomName && <div>{props.space.roomName}</div>}
          {props.space.floorName && <div>{props.space.floorName}</div>}
          {props.space.sqFt && <div>{props.space.sqFt} Sq Feet</div>}
          {props.tags && (
            <p className='card-text'>
              <i className='fas fa-tags' aria-hidden='true' /> {props.tags}
            </p>
          )}
        </div>
      </div>
      <br />
    </div>
  );
};

export default SpacesDetailContainer;
