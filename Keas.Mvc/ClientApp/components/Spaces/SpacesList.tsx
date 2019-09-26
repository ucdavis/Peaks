import * as React from 'react';
import { IKeyInfo, ISpace } from '../../Types';
import SpacesListItem from './SpacesListItem';

interface IProps {
  selectedKeyInfo?: IKeyInfo;
  spaces: ISpace[];
  onDisassociate?: (space: ISpace) => void;
  showDetails?: (space: ISpace) => void;
  // onAdd?: (space: ISpace) => void;
}

export default class SpacesList extends React.Component<IProps, {}> {
  public render() {
    const { spaces } = this.props;
    const spacesList =
      !spaces || spaces.length < 1 ? (
        <tr>
          <td colSpan={3}>No Spaces Found</td>
        </tr>
      ) : (
        spaces.map(this.renderItem)
      );
    return (
      <table className='table'>
        <thead>
          <tr>
            <th />
            <th>Room</th>
            <th>Room Name</th>
            <th className='list-actions'>Actions</th>
          </tr>
        </thead>
        <tbody>{spacesList}</tbody>
      </table>
    );
  }

  private renderItem = (space: ISpace) => {
    const { selectedKeyInfo } = this.props;

    return (
      <SpacesListItem
        key={space.id}
        space={space}
        onDisassociate={this.props.onDisassociate}
        showDetails={this.props.showDetails}
      />
    );
  };
}
