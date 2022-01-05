import * as React from 'react';
import { Button } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  keyInfo: IKeyInfo;
  onDisassociate?: (key: IKeyInfo) => void;
  onAdd?: (key: IKey) => void;
  showDetails?: (key: IKey) => void;
  onEdit?: (key: IKey) => void;
  onDelete?: (key: IKey) => void;
}

const KeyListItem = (props: IProps) => {
  const { keyInfo } = props;

  const actions: IAction[] = [];
  if (!!props.onDisassociate) {
    actions.push({
      onClick: () => props.onDisassociate(keyInfo),
      title: 'Disassociate'
    });
  }

  if (!!props.onDelete) {
    actions.push({
      title: 'Delete',
      onClick: () => props.onDelete(keyInfo.key)
    });
  }

  return (
    <tr>
      <td>
        <Button
          className='keys-anomaly'
          color='link'
          onClick={() => props.showDetails(props.keyInfo.key)}
        >
          Details
        </Button>
      </td>
      <td>{keyInfo.key.name}</td>
      <td>{keyInfo.key.code}</td>
      <td className=''>
        <i className='fas fa-key' /> {keyInfo.serialsInUseCount} /{' '}
        {keyInfo.serialsTotalCount}
      </td>
      <td>
        <ListActionsDropdown actions={actions} className='keys-anomaly' />
      </td>
    </tr>
  );
};

export default KeyListItem;
