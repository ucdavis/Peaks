import { AssetDetailsLink } from '../Shared/AssetDetailsLink';
import { KeyIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
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
        <AssetDetailsLink
          path={`keys/details/${props.keyInfo.key.id}`}
          onClick={() => props.showDetails(props.keyInfo.key)}
          className='keys-anomaly'
        />
      </td>
      <td>{keyInfo.key.name}</td>
      <td>{keyInfo.key.code}</td>
      <td className=''>
        <KeyIcon data-icon='key' className='hero-icon size-5' />{' '}
        {keyInfo.serialsInUseCount} / {keyInfo.serialsTotalCount}
      </td>
      <td>
        <ListActionsDropdown actions={actions} className='keys-anomaly' />
      </td>
    </tr>
  );
};

export default KeyListItem;
