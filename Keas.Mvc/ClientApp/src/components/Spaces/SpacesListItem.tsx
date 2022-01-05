import * as React from 'react';
import { Button } from 'reactstrap';
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
        <Button
          color='link'
          onClick={() => props.showDetails(props.space)}
        >
          Details
        </Button>
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
