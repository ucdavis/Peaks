import * as React from 'react';
import { RouteChildrenProps } from 'react-router';
import { Button } from 'reactstrap';
import { IMatchParams } from '../../models/Shared';
import { ISpaceInfo } from '../../models/Spaces';
import EquipmentContainer from '../Equipment/EquipmentContainer';
import KeyContainer from '../Keys/KeyContainer';
import WorkstationContainer from '../Workstations/WorkstationContainer';
import SpaceDetailContainer from './SpaceDetailContainer';

interface IProps {
  route: RouteChildrenProps<IMatchParams>;
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

const SpacesDetails = (props: IProps) => {
  if (!props.selectedSpaceInfo) {
    return null;
  }
  return (
    <div>
      <div>
        <Button color='link' onClick={props.goBack}>
          <i className='fas fa-arrow-left fa-xs' /> Return to Table
        </Button>
      </div>
      <br />
      <div>
        {props.selectedSpaceInfo && (
          <SpaceDetailContainer
            space={props.selectedSpaceInfo.space}
            tags={props.selectedSpaceInfo.tags}
          />
        )}
        <KeyContainer
          {...props.route}
          space={props.selectedSpaceInfo.space}
          assetInUseUpdated={props.inUseUpdated}
          assetTotalUpdated={props.totalUpdated}
          assetEdited={props.edited}
        />
        <EquipmentContainer
          {...props.route}
          space={props.selectedSpaceInfo.space}
          assetInUseUpdated={props.inUseUpdated}
          assetTotalUpdated={props.totalUpdated}
          assetEdited={props.edited}
        />
        <WorkstationContainer
          {...props.route}
          space={props.selectedSpaceInfo.space}
          tags={props.tags}
          assetInUseUpdated={props.inUseUpdated}
          assetTotalUpdated={props.totalUpdated}
          assetEdited={props.edited}
        />
      </div>
    </div>
  );
};

export default SpacesDetails;
