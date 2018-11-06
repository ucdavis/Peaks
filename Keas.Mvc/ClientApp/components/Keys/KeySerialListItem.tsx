import * as React from "react";

import { IKeySerial } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
  keySerial: IKeySerial;
  onRevoke?: (key: IKeySerial) => void;
  onAdd?: (key: IKeySerial) => void;
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
        <td>{keySerial.assignment ? "Assigned" : "Available"}</td>
        <td>
          <ListActionsDropdown
            showDetails={
              !!this.props.showDetails
                ? () => this.props.showDetails(keySerial)
                : null
            }
            onEdit={
              !!this.props.onEdit
                ? () => this.props.onEdit(keySerial)
                : null
            }
          />
        </td>
      </tr>
    );
  }
}
