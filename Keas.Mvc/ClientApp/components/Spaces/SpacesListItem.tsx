import * as React from "react";

import { ISpace } from "../../Types";
import ListActionsDropdown from "../ListActionsDropdown";

interface IProps {
  space: ISpace;
  onDisassociate?: (space: ISpace) => void;
  showDetails?: (space: ISpace) => void;
}

export default class SpacesListItem extends React.Component<IProps, {}> {
  public render() {
    const { space } = this.props;

    return (
      <tr>
        <td>{space.roomNumber} {space.bldgName}</td>
        <td>{space.roomName}</td>
        <td>
          <ListActionsDropdown
            showDetails={
              !!this.props.showDetails
                ? () => this.props.showDetails(space)
                : null
            }
            onRevoke={
              !!this.props.onDisassociate
                ? () => this.props.onDisassociate(space)
                : null
            }
          />
        </td>
      </tr>
    );
  }
}
