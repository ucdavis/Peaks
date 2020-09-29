import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  useHistory,
  useLocation,
  useParams,
  useRouteMatch
} from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IKeyInfo } from '../../models/Keys';
import { ISpace, ISpaceInfo } from '../../models/Spaces';
import { PermissionsUtil } from '../../util/permissions';
import AssociateSpace from '../Keys/AssociateSpace';
import DisassociateSpace from '../Keys/DisassociateSpace';
import Denied from '../Shared/Denied';
import SearchTags from '../Tags/SearchTags';
import SpacesDetails from './SpacesDetails';
import SpacesList from './SpacesList';
import SpacesTable from './SpacesTable';

interface IProps {
  selectedKeyInfo?: IKeyInfo;
  spacesTotalUpdated?: (keyId: number, count: number) => void;
}

interface IParams {
  team: string;
  action: string;
  id: string;
  assetType: string;
  containerAction: string;
  containerId: string;
}

interface IMatch {
  isExact: boolean;
  params: IParams;
  path: string;
  url: string;
}

const SpacesContainer = (props: IProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [spaces, setSpaces] = useState<ISpaceInfo[]>([]);
  const [tableFilters, setTableFilters] = useState<any[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const context = useContext(Context);
  const history = useHistory();
  const location = useLocation();
  const match: IMatch = useRouteMatch();
  const params: IParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewSpaces(context.permissions)) {
      return;
    }
    let spacesFetchUrl = '';
    if (!!props.selectedKeyInfo) {
      spacesFetchUrl = `/api/${context.team.slug}/spaces/getSpacesForKey?keyid=${props.selectedKeyInfo.id}`;
    } else {
      spacesFetchUrl = `/api/${context.team.slug}/spaces/list`;
    }

    const fetchSpaces = async () => {
      let spacesData: ISpaceInfo[] = null;
      try {
        spacesData = await context.fetch(spacesFetchUrl);
      } catch (err) {
        toast.error(
          'Error fetching spaces. Please refresh the page to try again.'
        );
        return;
      }
      setSpaces(spacesData);
    };

    fetchSpaces();
    setLoading(false);
  }, [context, props.selectedKeyInfo]);

  if (!PermissionsUtil.canViewSpaces(context.permissions)) {
    return <Denied viewName='Spaces' />;
  }
  if (loading) {
    return <h2>Loading...</h2>;
  }
  const { containerAction, containerId, action, id } = params;
  const onKeysTab = !!props.selectedKeyInfo;
  // if on keys tab, should be id
  // if on spaces tab, should be container id
  const selectedId = onKeysTab ? parseInt(id, 10) : parseInt(containerId, 10);
  const selectedSpaceInfo = spaces.find(k => k.id === selectedId);

  const shouldRenderDetailsView = !onKeysTab && containerAction === 'details';
  const shouldRenderTableView = !shouldRenderDetailsView;

  const renderTableOrList = (selectedId: number) => {
    const { selectedKeyInfo } = props;
    if (!!selectedKeyInfo) {
      return renderTableList(selectedId);
    }

    return renderTableView();
  };

  // if we are at route teamName/spaces
  const renderTableView = () => {
    let filteredSpaces = [];
    if (!!tagFilters && tagFilters.length > 0) {
      filteredSpaces = spaces.filter(x => checkFilters(x, tagFilters));
    } else {
      filteredSpaces = spaces;
    }

    return (
      <div>
        <SearchTags
          tags={context.tags}
          selected={tagFilters}
          onSelect={filterTags}
          disabled={false}
        />
        <SpacesTable
          spaces={filteredSpaces}
          showDetails={openDetails}
          filtered={tableFilters}
          updateFilters={updateTableFilters}
        />
      </div>
    );
  };

  const renderTableList = (selectedId: number) => {
    // flatten the space info for simple space
    const spacesData = spaces.map(s => s.space);
    const { action } = params;
    const selectedSpace = spacesData.find(k => k.id === selectedId);
    return (
      <div>
        {action === 'disassociate' &&
          renderDisassociateModal(selectedId, selectedSpace)}
        <SpacesList
          spaces={spacesData}
          showDetails={openDetails}
          onDisassociate={openDisassociateModal}
        />
      </div>
    );
  };

  // if we are at route teamName/spaces/details/spaceId
  const renderDetailsView = (selectedSpaceInfo: ISpaceInfo) => {
    const routeObject = {
      history: history,
      location: location,
      match: match
    };
    return (
      <SpacesDetails
        key={`spaces-details-${selectedSpaceInfo.id}`}
        route={routeObject}
        goBack={goBack}
        selectedSpaceInfo={selectedSpaceInfo}
        tags={context.tags}
        inUseUpdated={assetInUseUpdated}
        totalUpdated={assetTotalUpdated}
        edited={assetEdited}
      />
    );
  };

  const renderAssociateModal = () => {
    return (
      <AssociateSpace
        key={'associate-space'}
        selectedKeyInfo={props.selectedKeyInfo}
        onAssign={associateSpace}
        openModal={() => openAssociateModal(null)}
        closeModal={closeModals}
        isModalOpen={true}
        searchableTags={context.tags}
      />
    );
  };

  const renderDisassociateModal = (
    selectedId: number,
    selectedSpace: ISpace
  ) => {
    return (
      <DisassociateSpace
        key={`disassociate-space-${selectedId}`}
        selectedKeyInfo={props.selectedKeyInfo}
        selectedSpace={selectedSpace}
        onDisassociate={disassociateSpace}
        isModalOpen={!!selectedSpace}
        closeModal={closeModals}
      />
    );
  };

  const updateTableFilters = (filters: any[]) => {
    setTableFilters(filters);
  };

  const openDetails = (space: ISpace) => {
    const { team } = context;
    history.push(`/${team.slug}/spaces/details/${space.id}`);
  };

  const openAssociateModal = (space: ISpace) => {
    if (!!space) {
      history.push(`${getBaseUrl()}/spaces/associate/${space.id}`);
      return;
    }

    history.push(`${getBaseUrl()}/spaces/associate/`);
  };

  const openDisassociateModal = (space: ISpace) => {
    history.push(`${getBaseUrl()}/spaces/disassociate/${space.id}`);
  };

  const closeModals = () => {
    history.push(`${getBaseUrl()}`);
  };

  const goBack = () => {
    history.push(`${getBaseUrl()}/spaces`);
  };

  // managing counts for assigned or revoked
  const assetInUseUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    // this is called when we are assigning or revoking an asset
    const index = spaces.findIndex(x => x.id === spaceId);
    if (index > -1) {
      const spacesData = [...spaces];
      switch (type) {
        case 'workstation':
          spacesData[index].workstationsInUse += count;
      }
      setSpaces(spacesData);
    }
  };

  const assetTotalUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    // this is called when we are either changing the room on an asset, or creating a workstation
    const index = spaces.findIndex(x => x.id === spaceId);
    if (index > -1) {
      const spacesData = [...spaces];
      switch (type) {
        case 'equipment':
          spacesData[index].equipmentCount += count;
          break;
        case 'key':
          spacesData[index].keyCount += count;
          break;
        case 'workstation':
          spacesData[index].workstationsTotal += count;
      }
      setSpaces(spacesData);
    }
  };

  const assetEdited = async (
    type: string,
    spaceId: number,
    personId: number
  ) => {
    const index = spaces.findIndex(x => x.id === spaceId);
    if (index > -1) {
      const tags = await context.fetch(
        `/api/${context.team.slug}/spaces/getTagsInSpace?spaceId=${spaceId}`
      );
      const spacesData = [...spaces];
      spacesData[index].tags = tags;
      setSpaces(spacesData);
    }
  };

  const associateSpace = async (space: ISpace, keyInfo: IKeyInfo) => {
    const { team } = context;

    const request = {
      spaceId: space.id
    };

    const associateUrl = `/api/${team.slug}/keys/associateSpace/${keyInfo.id}`;
    try {
      await context.fetch(associateUrl, {
        body: JSON.stringify(request),
        method: 'POST'
      });
      toast.success('Successfully associated space!');
    } catch (err) {
      toast.error('Error associating space.');
      throw new Error(); // throw error so modal doesn't close
    }

    const spaceInfo: ISpaceInfo = {
      equipmentCount: 0,
      id: space.id,
      keyCount: 0,
      space,
      tags: '',
      workstationsInUse: 0,
      workstationsTotal: 0
    };
    const updatedSpaces = [...spaces, spaceInfo];
    setSpaces(updatedSpaces);
    props.spacesTotalUpdated(props.selectedKeyInfo.id, 1);
  };

  const disassociateSpace = async (keyInfo: IKeyInfo, space: ISpace) => {
    const { team } = context;

    const request = {
      spaceId: space.id
    };

    const disassociateUrl = `/api/${team.slug}/keys/disassociateSpace/${keyInfo.id}`;
    try {
      await context.fetch(disassociateUrl, {
        body: JSON.stringify(request),
        method: 'POST'
      });
      toast.success('Successfully disassociated space!');
    } catch (err) {
      toast.error('Error disassociating space.');
      throw new Error();
    }
    const updatedSpaces = [...spaces];
    const index = updatedSpaces.findIndex(s => s.space.id === space.id);
    updatedSpaces.splice(index, 1);

    setSpaces(updatedSpaces);
    props.spacesTotalUpdated(props.selectedKeyInfo.id, -1);
  };

  const getBaseUrl = () => {
    const { team } = context;
    const { selectedKeyInfo } = props;

    if (!!selectedKeyInfo) {
      return `/${team.slug}/keys/details/${selectedKeyInfo.id}`;
    }

    return `/${team.slug}`;
  };

  const filterTags = (filters: string[]) => {
    setTagFilters(filters);
  };

  const checkFilters = (space: ISpaceInfo, filters: string[]) => {
    return filters.every(
      f => !!space && !!space.tags && space.tags.includes(f)
    );
  };

  return (
    <div className='card spaces-color'>
      <div className='card-header-spaces'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-building fa-xs' /> Spaces
          </h2>
          {shouldRenderTableView && onKeysTab && (
            <div>
              <Button color='link' onClick={() => openAssociateModal(null)}>
                <i className='fas fa-plus fa-sm mr-2' aria-hidden='true' />
                Associate
              </Button>
              {action === 'associate' && renderAssociateModal()}
            </div>
          )}
        </div>
        {spaces.length === 0 && (
          <div className='card-body'>
            Don't see your spaces? Visit the{' '}
            <a
              href='https://computing.caes.ucdavis.edu/documentation/peaks/spaces'
              target='_blank'
              rel='noopener noreferrer'
            >
              Space FAQ
            </a>
            .
          </div>
        )}
      </div>

      <div className='card-content'>
        {
          shouldRenderTableView && renderTableOrList(selectedId) // show on keys/details page
        }
        {shouldRenderDetailsView &&
          !onKeysTab &&
          !!selectedSpaceInfo &&
          !!selectedSpaceInfo.space &&
          renderDetailsView(selectedSpaceInfo)}
      </div>
    </div>
  );
};

export default SpacesContainer;
