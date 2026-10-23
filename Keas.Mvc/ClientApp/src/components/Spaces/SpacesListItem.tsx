import { AssetDetailsLink } from '../Shared/AssetDetailsLink';
import * as React from 'react';
import { ISpace } from '../../models/Spaces';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  space: ISpace;
  onDisassociate?: (space: ISpace) => void;
  showDetails?: (space: ISpace) => void;
}

const SpacesListItem = (props: IProps) => {
  const { space } = props;

  const actions: IAction[] = [];

  if (!!props.onDisassociate) {
    actions.push({
      onClick: () => props.onDisassociate(space),
      title: 'Disassociate'
    });
  }

  return (
    <tr>
      <td>
        <AssetDetailsLink
          path={`spaces/details/${props.space.id}`}
          onClick={() => props.showDetails(props.space)}
        />
      </td>
      <td>
        {space.roomNumber} {space.bldgName}
      </td>
      <td>{space.roomName}</td>
      <td>
        <ListActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export default SpacesListItem;
