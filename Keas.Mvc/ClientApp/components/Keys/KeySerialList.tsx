import * as React from 'react';
import { IKeySerial } from '../../models/KeySerials';
import KeySerialListItem from './KeySerialListItem';

interface IProps {
  keySerials: IKeySerial[];
  onAssign?: (keySerial: IKeySerial) => void;
  onRevoke?: (keySerial: IKeySerial) => void;
  onUpdate?: (keySerial: IKeySerial) => void;
  showDetails?: (keySerial: IKeySerial) => void;
  onEdit?: (keySerial: IKeySerial) => void;
}

const KeySerialList = (props: IProps) => {
  const renderItem = key => {
    return (
      <KeySerialListItem
        key={key.id}
        keySerial={key}
        onRevoke={props.onRevoke}
        onAssign={props.onAssign}
        onUpdate={props.onUpdate}
        showDetails={props.showDetails}
        onEdit={props.onEdit}
      />
    );
  };

  const { keySerials } = props;
  const serials =
    !keySerials || keySerials.length < 1 ? (
      <tr>
        <td colSpan={6}>No Key Serials Found</td>
      </tr>
    ) : (
      keySerials.map(renderItem)
    );

  return (
    <table className='table'>
      <thead>
        <tr>
          <th />
          <th>Key Code</th>
          <th>Serial Number</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Expiration</th>
          <th className='list-actions'>Actions</th>
        </tr>
      </thead>
      <tbody>{serials}</tbody>
    </table>
  );
};

export default KeySerialList;
