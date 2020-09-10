import * as React from 'react';
import { IKeyInfo } from '../../models/Keys';
import { ISpace } from '../../models/Spaces';
import SpacesListItem from './SpacesListItem';

interface IProps {
  spaces: ISpace[];
  onDisassociate?: (space: ISpace) => void;
  showDetails?: (space: ISpace) => void;
}

const SpacesList = (props: IProps) => {
  const renderItem = (space: ISpace) => {
    return (
      <SpacesListItem
        key={space.id}
        space={space}
        onDisassociate={props.onDisassociate}
        showDetails={props.showDetails}
      />
    );
  };

  const { spaces } = props;
  const spacesList =
    !spaces || spaces.length < 1 ? (
      <tr>
        <td colSpan={3}>No Spaces Found</td>
      </tr>
    ) : (
      spaces.map(renderItem)
    );

  return (
    <table className='table'>
      <thead>
        <tr>
          <th />
          <th>Room</th>
          <th>Room Name</th>
          <th className='list-actions'>Actions</th>
        </tr>
      </thead>
      <tbody>{spacesList}</tbody>
    </table>
  );
};

export default SpacesList;
