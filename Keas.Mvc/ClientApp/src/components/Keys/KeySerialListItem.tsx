import * as React from 'react';
import { Button } from 'reactstrap';
import { IKeySerial } from '../../models/KeySerials';
import { DateUtil } from '../../util/dates';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  keySerial: IKeySerial;
  onRevoke?: (key: IKeySerial) => void;
  onAssign?: (key: IKeySerial) => void;
  onUpdate?: (key: IKeySerial) => void;
  showDetails?: (key: IKeySerial) => void;
  onEdit?: (key: IKeySerial) => void;
}

const KeySerialListItem = (props: IProps) => {
  const { keySerial } = props;
  const actions: IAction[] = [];

  if (!!props.onAssign && !keySerial.keySerialAssignment) {
    actions.push({
      onClick: () => props.onAssign(keySerial),
      title: 'Assign'
    });
  }

  if (!!props.onRevoke && !!keySerial.keySerialAssignment) {
    actions.push({
      onClick: () => props.onRevoke(keySerial),
      title: 'Revoke'
    });
  }

  return (
    <tr>
      <td>
        <Button color='link' onClick={() => props.showDetails(props.keySerial)}>
          Details
        </Button>
      </td>
      <td>{keySerial.key.code}</td>
      <td>{keySerial.number}</td>
      <td>
        <span className='text-mono'>{keySerial.status}</span>
      </td>
      <td>
        {!!keySerial.keySerialAssignment?.person
          ? `${keySerial.keySerialAssignment.person.lastName}, ${keySerial.keySerialAssignment.person.firstName}`
          : ''}
      </td>
      <td>
        {keySerial.keySerialAssignment
          ? DateUtil.formatExpiration(keySerial.keySerialAssignment.expiresAt)
          : ''}
      </td>
      <td>
        <ListActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export default KeySerialListItem;
