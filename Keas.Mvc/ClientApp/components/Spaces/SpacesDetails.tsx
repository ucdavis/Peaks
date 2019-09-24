import * as React from 'react';
import { Button } from 'reactstrap';
import { ISpaceInfo } from '../../Types';
import EquipmentContainer from '../Equipment/EquipmentContainer';
import KeyContainer from '../Keys/KeyContainer';
import WorkstationContainer from '../Workstations/WorkstationContainer';
import SpaceDetailContainer from './SpaceDetailContainer';

interface IProps {
  goBack: () => void;
  selectedSpaceInfo: ISpaceInfo;
  inUseUpdated: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  totalUpdated: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  edited: (type: string, spaceId: number, personId: number) => void;
  tags: string[];
}

export default class SpacesDetails extends React.Component<IProps, {}> {
  public render() {
    if (!this.props.selectedSpaceInfo) {
      return null;
    }
    return (
      <div>
        <div>
          <Button color='link' onClick={this.props.goBack}>
            <i className='fas fa-arrow-left fa-xs' /> Return to Table
          </Button>
        </div>
        <br />
        <div>
          {this.props.selectedSpaceInfo && (
            <SpaceDetailContainer
              space={this.props.selectedSpaceInfo.space}
              tags={this.props.selectedSpaceInfo.tags}
            />
          )}
          <KeyContainer
            space={this.props.selectedSpaceInfo.space}
            assetInUseUpdated={this.props.inUseUpdated}
            assetTotalUpdated={this.props.totalUpdated}
            assetEdited={this.props.edited}
          />
          <EquipmentContainer
            space={this.props.selectedSpaceInfo.space}
            assetInUseUpdated={this.props.inUseUpdated}
            assetTotalUpdated={this.props.totalUpdated}
            assetEdited={this.props.edited}
          />
          <WorkstationContainer
            space={this.props.selectedSpaceInfo.space}
            tags={this.props.tags}
            assetInUseUpdated={this.props.inUseUpdated}
            assetTotalUpdated={this.props.totalUpdated}
            assetEdited={this.props.edited}
          />
        </div>
      </div>
    );
  }
}
