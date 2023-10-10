import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import KeyListItem from './KeyListItem';

interface IProps {
  keysInfo: IKeyInfo[];
  onDisassociate?: (key: IKeyInfo) => void;
  onAdd?: (key: IKey) => void;
  showDetails?: (key: IKey) => void;
  onEdit?: (key: IKey) => void;
  onDelete?: (key: IKey) => void;
}

const KeyList = (props: IProps) => {
  const renderItem = keyInfo => {
    return (
      <KeyListItem
        key={keyInfo.id}
        keyInfo={keyInfo}
        onDisassociate={props.onDisassociate}
        onAdd={props.onAdd}
        onDelete={props.onDelete}
        showDetails={props.showDetails}
        onEdit={props.onEdit}
      />
    );
  };

  const { keysInfo } = props;
  const keys =
    !keysInfo || keysInfo.length < 1 ? (
      <tr>
        <td colSpan={4}>No Keys Found</td>
      </tr>
    ) : (
      keysInfo.map(renderItem)
    );

  return (
    <table className='table'>
      <thead>
        <tr>
          <th />
          <th>Key Name</th>
          <th>Key Code</th>
          <th>
            Serials{' '}
            <i id='serialTooltip' className='fas fa-info-circle keys-anomaly' />
            <UncontrolledTooltip placement='right' target='serialTooltip'>
              In Use / Total
            </UncontrolledTooltip>
          </th>
          <th className='list-actions'>Actions</th>
        </tr>
      </thead>
      <tbody>{keys}</tbody>
    </table>
  );
};

export default KeyList;
