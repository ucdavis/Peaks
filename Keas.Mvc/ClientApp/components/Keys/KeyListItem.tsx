import * as React from "react";

import { IKey } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
  keyEntity: IKey;
  onDisassociate?: (key: IKey) => void;
  onAdd?: (key: IKey) => void;
  showDetails?: (key: IKey) => void;
  onEdit?: (key: IKey) => void;
}

export default class KeyListItem extends React.Component<IProps, {}> {
  public render() {
    const { keyEntity } = this.props;
    const keySerials = keyEntity.serials || [];

    const total = keySerials.length;
    const available = keySerials.filter(s => !s.keySerialAssignment).length;

    return (
      <tr>
        <td>{keyEntity.name}</td>
        <td>{keyEntity.code}</td>
        <td className=""><i className="fas fa-key"/> {available} / {total}</td>
        <td>
          <ListActionsDropdown
            showDetails={
              !!this.props.showDetails
                ? () => this.props.showDetails(keyEntity)
                : null
            }
            onEdit={
              !!this.props.onEdit
                ? () => this.props.onEdit(keyEntity)
                : null
            }
            onRevoke={
              !!this.props.onDisassociate
                ? () => this.props.onDisassociate(keyEntity)
                : null
            }
          />
        </td>
      </tr>
    );
  }
}
