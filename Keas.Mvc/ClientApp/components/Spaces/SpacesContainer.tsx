import * as React from 'react';
import { RouteChildrenProps } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IKeyInfo } from '../../models/Keys';
import { IMatchParams } from '../../models/Shared';
import { ISpace, ISpaceInfo } from '../../models/Spaces';
import { PermissionsUtil } from '../../util/permissions';
import AssociateSpace from '../Keys/AssociateSpace';
import DisassociateSpace from '../Keys/DisassociateSpace';
import Denied from '../Shared/Denied';
import SearchTags from '../Tags/SearchTags';
import SpacesDetails from './SpacesDetails';
import SpacesList from './SpacesList';
import SpacesTable from './SpacesTable';

interface IProps extends RouteChildrenProps<IMatchParams> {
  selectedKeyInfo?: IKeyInfo;
  spacesTotalUpdated?: (keyId: number, count: number) => void;
}

interface IState {
  spaces: ISpaceInfo[];
  loading: boolean;
  tableFilters: any[]; // object containing filters on table
  tagFilters: string[]; // array of filters from SearchTags
}
export default class SpacesContainer extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      spaces: [],
      tableFilters: [],
      tagFilters: []
    };
  }

  public async componentDidMount() {
    if (!PermissionsUtil.canViewSpaces(this.context.permissions)) {
      return;
    }
    const { selectedKeyInfo } = this.props;
    const { team } = this.context;

    let spacesFetchUrl = '';
    if (!!selectedKeyInfo) {
      spacesFetchUrl = `/api/${team.slug}/spaces/getSpacesForKey?keyid=${selectedKeyInfo.id}`;
    } else {
      spacesFetchUrl = `/api/${team.slug}/spaces/list`;
    }

    let spaces: ISpaceInfo[] = null;
    try {
      spaces = await this.context.fetch(spacesFetchUrl);
    } catch (err) {
      toast.error(
        'Error fetching spaces. Please refresh the page to try again.'
      );
      return;
    }

    this.setState({ loading: false, spaces });
  }

  public render() {
    if (!PermissionsUtil.canViewSpaces(this.context.permissions)) {
      return <Denied viewName='Spaces' />;
    }
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    const {
      containerAction,
      containerId,
      assetType,
      action,
      id
    } = this.props.match.params;
    const activeWorkstationAsset = assetType === 'workstations';
    const onKeysTab = !!this.props.selectedKeyInfo;
    // if on keys tab, should be id
    // if on spaces tab, should be container id
    const selectedId = onKeysTab ? parseInt(id, 10) : parseInt(containerId, 10);
    const selectedSpaceInfo = this.state.spaces.find(k => k.id === selectedId);

    const shouldRenderDetailsView = !onKeysTab && containerAction === 'details';
    const shouldRenderTableView = !shouldRenderDetailsView;
    return (
      <div className='card spaces-color'>
        <div className='card-header-spaces'>
          <div className='card-head row justify-content-between'>
            <h2>
              <i className='fas fa-building fa-xs' /> Spaces
            </h2>
            {shouldRenderTableView && onKeysTab && (
              <div>
                <Button
                  color='link'
                  onClick={() => this._openAssociateModal(null)}
                >
                  <i className='fas fa-plus fa-sm mr-2' aria-hidden='true' />
                  Associate
                </Button>
                {action === 'associate' && this._renderAssociateModal()}
              </div>
            )}
          </div>
          {this.state.spaces.length === 0 && (
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
          {shouldRenderTableView && this._renderTableOrList(selectedId) // show on keys/details page
          }
          {shouldRenderDetailsView &&
            !onKeysTab &&
            !!selectedSpaceInfo &&
            !!selectedSpaceInfo.space &&
            this._renderDetailsView(selectedSpaceInfo)}
        </div>
      </div>
    );
  }

  private _renderTableOrList(selectedId: number) {
    const { selectedKeyInfo } = this.props;
    if (!!selectedKeyInfo) {
      return this._renderTableList(selectedId);
    }

    return this._renderTableView();
  }

  // if we are at route teamName/spaces
  private _renderTableView() {
    let filteredSpaces = [];
    if (!!this.state.tagFilters && this.state.tagFilters.length > 0) {
      filteredSpaces = this.state.spaces.filter(x =>
        this._checkFilters(x, this.state.tagFilters)
      );
    } else {
      filteredSpaces = this.state.spaces;
    }

    return (
      <div>
        <SearchTags
          tags={this.context.tags}
          selected={this.state.tagFilters}
          onSelect={this._filterTags}
          disabled={false}
        />
        <SpacesTable
          spaces={filteredSpaces}
          showDetails={this._openDetails}
          filtered={this.state.tableFilters}
          updateFilters={this._updateTableFilters}
        />
      </div>
    );
  }

  private _renderTableList = (selectedId: number) => {
    // this is what is rendered inside of KeyContainer
    const { selectedKeyInfo } = this.props;

    // flatten the space info for simple space
    const spaces = this.state.spaces.map(s => s.space);
    const { containerId, action, id } = this.props.match.params;
    const selectedSpace = spaces.find(k => k.id === selectedId);
    return (
      <div>
        {action === 'disassociate' &&
          this._renderDisassociateModal(selectedId, selectedSpace)}
        <SpacesList
          selectedKeyInfo={selectedKeyInfo}
          spaces={spaces}
          showDetails={this._openDetails}
          onDisassociate={this._openDisassociateModal}
        />
      </div>
    );
  };

  // if we are at route teamName/spaces/details/spaceId
  private _renderDetailsView = (selectedSpaceInfo: ISpaceInfo) => {
    const routeObject = {
      history: this.props.history,
      location: this.props.location,
      match: this.props.match
    };
    return (
      <SpacesDetails
        key={`spaces-details-${selectedSpaceInfo.id}`}
        route={routeObject}
        goBack={this._goBack}
        selectedSpaceInfo={selectedSpaceInfo}
        tags={this.context.tags}
        inUseUpdated={this._assetInUseUpdated}
        totalUpdated={this._assetTotalUpdated}
        edited={this._assetEdited}
      />
    );
  };

  private _renderAssociateModal = () => {
    return (
      <AssociateSpace
        key={'associate-space'}
        selectedKeyInfo={this.props.selectedKeyInfo}
        onAssign={this._associateSpace}
        openModal={() => this._openAssociateModal(null)}
        closeModal={this._closeModals}
        isModalOpen={true}
        searchableTags={this.context.tags}
      />
    );
  };

  private _renderDisassociateModal = (
    selectedId: number,
    selectedSpace: ISpace
  ) => {
    return (
      <DisassociateSpace
        key={`disassociate-space-${selectedId}`}
        selectedKeyInfo={this.props.selectedKeyInfo}
        selectedSpace={selectedSpace}
        onDisassociate={this._disassociateSpace}
        isModalOpen={!!selectedSpace}
        closeModal={this._closeModals}
      />
    );
  };

  private _updateTableFilters = (filters: any[]) => {
    this.setState({ tableFilters: filters });
  };

  private _openDetails = (space: ISpace) => {
    const { team } = this.context;
    this.props.history.push(`/${team.slug}/spaces/details/${space.id}`);
  };

  private _openAssociateModal = (space: ISpace) => {
    if (!!space) {
      this.props.history.push(
        `${this._getBaseUrl()}/spaces/associate/${space.id}`
      );
      return;
    }

    this.props.history.push(`${this._getBaseUrl()}/spaces/associate/`);
  };

  private _openDisassociateModal = (space: ISpace) => {
    this.props.history.push(
      `${this._getBaseUrl()}/spaces/disassociate/${space.id}`
    );
  };

  private _closeModals = () => {
    this.props.history.push(`${this._getBaseUrl()}`);
  };

  private _goBack = () => {
    this.props.history.push(`${this._getBaseUrl()}/spaces`);
  };

  // managing counts for assigned or revoked
  private _assetInUseUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    // this is called when we are assigning or revoking an asset
    const index = this.state.spaces.findIndex(x => x.id === spaceId);
    if (index > -1) {
      const spaces = [...this.state.spaces];
      switch (type) {
        case 'workstation':
          spaces[index].workstationsInUse += count;
      }
      this.setState({ spaces });
    }
  };

  private _assetTotalUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    // this is called when we are either changing the room on an asset, or creating a workstation
    const index = this.state.spaces.findIndex(x => x.id === spaceId);
    if (index > -1) {
      const spaces = [...this.state.spaces];
      switch (type) {
        case 'equipment':
          spaces[index].equipmentCount += count;
          break;
        case 'key':
          spaces[index].keyCount += count;
          break;
        case 'workstation':
          spaces[index].workstationsTotal += count;
      }
      this.setState({ spaces });
    }
  };

  private _assetEdited = async (
    type: string,
    spaceId: number,
    personId: number
  ) => {
    const index = this.state.spaces.findIndex(x => x.id === spaceId);
    if (index > -1) {
      const tags = await this.context.fetch(
        `/api/${this.context.team.slug}/spaces/getTagsInSpace?spaceId=${spaceId}`
      );
      const spaces = [...this.state.spaces];
      spaces[index].tags = tags;
      this.setState({ spaces });
    }
  };

  private _associateSpace = async (space: ISpace, keyInfo: IKeyInfo) => {
    const { team } = this.context;
    const { spaces } = this.state;

    const request = {
      spaceId: space.id
    };

    const associateUrl = `/api/${team.slug}/keys/associateSpace/${keyInfo.id}`;
    try {
      const result = await this.context.fetch(associateUrl, {
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
    this.setState({
      spaces: updatedSpaces
    });
    this.props.spacesTotalUpdated(this.props.selectedKeyInfo.id, 1);
  };

  private _disassociateSpace = async (keyInfo: IKeyInfo, space: ISpace) => {
    const { team } = this.context;
    const { spaces } = this.state;

    const request = {
      spaceId: space.id
    };

    const disassociateUrl = `/api/${team.slug}/keys/disassociateSpace/${keyInfo.id}`;
    try {
      const result = await this.context.fetch(disassociateUrl, {
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

    this.setState({
      spaces: updatedSpaces
    });
    this.props.spacesTotalUpdated(this.props.selectedKeyInfo.id, -1);
  };

  private _getBaseUrl = () => {
    const { team } = this.context;
    const { selectedKeyInfo } = this.props;

    if (!!selectedKeyInfo) {
      return `/${team.slug}/keys/details/${selectedKeyInfo.id}`;
    }

    return `/${team.slug}`;
  };

  private _filterTags = (filters: string[]) => {
    this.setState({ tagFilters: filters });
  };

  private _checkFilters = (space: ISpaceInfo, filters: string[]) => {
    return filters.every(
      f => !!space && !!space.tags && space.tags.includes(f)
    );
  };
}
