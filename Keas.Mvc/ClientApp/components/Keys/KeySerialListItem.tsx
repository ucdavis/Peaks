import * as React from "react";

import { DateUtil } from "../../util/dates";
import { IKeySerial } from "../../Types";
import ListActionsDropdown, { IAction } from "../ListActionsDropdown";

interface IProps {
  keySerial: IKeySerial;
  onRevoke?: (key: IKeySerial) => void;
  onAssign?: (key: IKeySerial) => void;
  onUpdate?: (key: IKeySerial) => void;
  showDetails?: (key: IKeySerial) => void;
  onEdit?: (key: IKeySerial) => void;
}

export default class KeyListItem extends React.Component<IProps, {}> {
  public render() {
    const { keySerial } = this.props;

    const actions: IAction[] = [];
    if (!!this.props.onAssign && !keySerial.keySerialAssignment) {
      actions.push({ title: 'Assign', onClick: () => this.props.onAssign(keySerial) });
    }

    if (!!this.props.onEdit) {
      actions.push({ title: 'Edit', onClick: () => this.props.onEdit(keySerial) });
    }
    
    if (!!this.props.showDetails) {
        actions.push({ title: 'Details', onClick: () => this.props.showDetails(keySerial) });
    }

    if (!!this.props.onUpdate && !!keySerial.keySerialAssignment) {
      actions.push({ title: 'Update', onClick: () => this.props.onUpdate(keySerial) });
    }

    if (!!this.props.onRevoke && !!keySerial.keySerialAssignment) {
      actions.push({ title: 'Revoke', onClick: () => this.props.onRevoke(keySerial) });
    }
    
    return (
      <tr>
        <td>{keySerial.key.code}</td>
                <td>{keySerial.number}</td>
                <td>
                    <span className="text-mono">{keySerial.status}</span>
                </td>
                <td>
                    {keySerial.keySerialAssignment ? keySerial.keySerialAssignment.person.name : ""}
                </td>
                <td>
                    {keySerial.keySerialAssignment
                        ? DateUtil.formatExpiration(keySerial.keySerialAssignment.expiresAt)
                        : ""}
                </td>
                <td>
                    <ListActionsDropdown actions={actions} />
                </td>
      </tr>
    );
  }
}
