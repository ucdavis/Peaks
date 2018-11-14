import * as React from "react";

import { IKeySerial } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
  keySerial: IKeySerial;
  onRevoke?: (key: IKeySerial) => void;
  onAssign?: (key: IKeySerial) => void;
  showDetails?: (key: IKeySerial) => void;
  onEdit?: (key: IKeySerial) => void;
}

export default class KeyListItem extends React.Component<IProps, {}> {
  public render() {
    const { keySerial } = this.props;

    return (
      <tr>
        <td>{keySerial.key.code}</td>
        <td>{keySerial.number}</td>
        <td>{keySerial.keySerialAssignment ? keySerial.keySerialAssignment.person.name : ""}</td>
        <td>{keySerial.keySerialAssignment ? keySerial.keySerialAssignment.expiresAt : ""}</td>
        <td>
          <ListActionsDropdown
            showDetails={
              !!this.props.showDetails
                ? () => this.props.showDetails(keySerial)
                : null
            }
            onAdd={
              (!!this.props.onAssign && !keySerial.keySerialAssignment)
                ? () => this.props.onAssign(keySerial)
                : null
            }
            onEdit={
              !!this.props.onEdit
                ? () => this.props.onEdit(keySerial)
                : null
            }
            onRevoke={
              (!!this.props.onRevoke && keySerial.keySerialAssignment)
                ? () => this.props.onRevoke(keySerial)
                : null
            }
          />
        </td>
      </tr>
    );
  }
}
