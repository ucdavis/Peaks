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
import { IKey, IKeyInfo } from '../../models/Keys';
import { IMatchParams } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import SearchTags from '../Tags/SearchTags';
import AssociateSpace from './AssociateSpace';
import CreateKey from './CreateKey';
import DeleteKey from './DeleteKey';
import DisassociateSpace from './DisassociateSpace';
import KeyDetailContainer from './KeyDetailContainer';
import KeyList from './KeyList';
import KeyTable from './KeyTable';

interface IProps {
  assetInUseUpdated?: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;

  assetTotalUpdated?: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;

  assetEdited?: (type: string, spaceId: number, personId: number) => void;
  space?: ISpace;
}

interface IMatch {
  isExact: boolean;
  params: IMatchParams;
  path: string;
  url: string;
}

const KeyContainer = (props: IProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [keys, setKeys] = useState<IKeyInfo[]>([]);
  const [tableFilters, setTableFilters] = useState<any[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const context = useContext(Context);
  const history = useHistory();
  const location = useLocation();
  const match: IMatch = useRouteMatch();
  const params: IMatchParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewKeys(context.permissions)) {
      return;
    }

    // are we getting the person's key or the team's?
    let keyFetchUrl = '';
    if (!!props.space) {
      keyFetchUrl = `/api/${context.team.slug}/keys/getKeysInSpace?spaceId=${props.space.id}`;
    } else {
      keyFetchUrl = `/api/${context.team.slug}/keys/list/`;
    }

    const fetchKeys = async () => {
      let newKeys: IKeyInfo[] = null;
      try {
        newKeys = await context.fetch(keyFetchUrl);
      } catch (err) {
        toast.error(
          'Failed to fetch keys. Please refresh the page to try again.'
        );
        return;
      }

      setKeys(newKeys);
      setLoading(false);
    };

    fetchKeys();
  }, [context, props.space]);

  const renderTableOrListView = (selectedKeyId: number) => {
    const { space } = props;
    if (!space) {
      return renderTableView();
    }

    return renderListView(selectedKeyId);
  };

  const renderTableView = () => {
    let filteredKeys = keys;

    // check for tag filters
    if (tagFilters && tagFilters.length) {
      filteredKeys = keys
        .filter(k => !!k.key && k.key.tags && k.key.tags.length)
        .filter(k => {
          const keyTags = k.key.tags.split(',');
          return tagFilters.every(t => keyTags.includes(t));
        });
    }

    return (
      <div>
        <SearchTags
          tags={context.tags}
          disabled={false}
          selected={tagFilters}
          onSelect={onTagsFiltered}
        />
        <KeyTable
          keysInfo={filteredKeys}
          onEdit={openEditModal}
          showDetails={openDetailsModal}
          onDelete={openDeleteModal}
          filters={tableFilters}
          onFiltersChange={onTableFiltered}
        />
      </div>
    );
  };

  const renderListView = (selectedKeyId: number) => {
    // this is what is rendered inside of space container
    const { action } = params;
    const selectedKeyInfo = keys.find(k => k.id === selectedKeyId);
    return (
      <div>
        {action === 'disassociate' &&
          renderDisassociateModal(selectedKeyId, selectedKeyInfo)}
        <KeyList
          keysInfo={keys}
          onEdit={openEditModal}
          showDetails={openDetailsModal}
          onDelete={openDeleteModal}
          onDisassociate={openDisassociate}
        />
      </div>
    );
  };

  const renderDetailsView = () => {
    const { containerId } = params;
    const selectedKeyId = parseInt(containerId, 10);
    const selectedKeyInfo = keys.find(k => k.id === selectedKeyId);

    const routeObject = {
      history: history,
      location: location,
      match: match
    };

    return (
      <KeyDetailContainer
        key={`key-details-${selectedKeyId}`}
        route={routeObject}
        selectedKeyInfo={selectedKeyInfo}
        goBack={closeModals}
        serialInUseUpdated={serialInUseUpdated}
        serialTotalUpdated={serialTotalUpdated}
        spacesTotalUpdated={spacesTotalUpdated}
        openEditModal={openEditModal}
        checkValidKeyCodeOnEdit={checkIfKeyCodeIsValidOnEdit}
        editKey={editKey}
      />
    );
  };
  const renderAssociateModal = (selectedId: number, keyInfo: IKeyInfo) => {
    return (
      <AssociateSpace
        key={`associate-space-${selectedId}`}
        selectedKeyInfo={keyInfo}
        selectedSpace={props.space}
        onAssign={associateSpace}
        isModalOpen={true}
        openModal={openAssociate}
        closeModal={closeModals}
        searchableTags={context.tags}
      />
    );
  };

  const renderDisassociateModal = (
    selectedId: number,
    selectedKeyInfo: IKeyInfo
  ) => {
    return (
      <DisassociateSpace
        key={`disassociate-key-${selectedId}`}
        selectedKeyInfo={selectedKeyInfo}
        selectedSpace={props.space}
        onDisassociate={disassociateSpace}
        isModalOpen={!!selectedKeyInfo}
        closeModal={closeModals}
      />
    );
  };

  const renderDeleteModal = (selectedId: number, keyInfo: IKeyInfo) => {
    return (
      <DeleteKey
        key={`delete-key-${selectedId}`}
        selectedKeyInfo={keyInfo}
        deleteKey={deleteKey}
        closeModal={closeModals}
        modal={!!keyInfo}
      />
    );
  };

  const createKey = async (key: IKey) => {
    const request = {
      code: key.code,
      name: key.name,
      notes: key.notes,
      tags: key.tags
    };

    const createUrl = `/api/${context.team.slug}/keys/create`;
    try {
      key = await context.fetch(createUrl, {
        body: JSON.stringify(request),
        method: 'POST'
      });
      toast.success('Key created successfully!');
    } catch (err) {
      toast.error('Error creating key.');
      throw new Error(); // throw error so modal doesn't close
    }

    const index = keys.findIndex(x => x.id === key.id);
    let keyInfo: IKeyInfo = {
      id: key.id,
      key,
      serialsInUseCount: 0,
      serialsTotalCount: 0,
      spacesCount: 0
    };

    if (index !== -1) {
      // update already existing entry in key
      const updateKeys = [...keys];
      updateKeys[index].key = key;
      keyInfo = updateKeys[index];
      setKeys(updateKeys);
    } else {
      setKeys(prevKeys => [...prevKeys, keyInfo]);
    }

    if (props.assetTotalUpdated) {
      props.assetTotalUpdated(
        'key',
        props.space ? props.space.id : null,
        null,
        1
      );
    }

    return keyInfo;
  };

  const checkIfKeyCodeIsValid = (code: string) => {
    return !keys.some(x => x.key.code === code);
  };

  const checkIfKeyCodeIsValidOnEdit = (code: string, id: number) => {
    return !keys.some(x => x.id !== id && x.key.code === code);
  };

  const editKey = async (key: IKey) => {
    const index = keys.findIndex(x => x.id === key.id);

    // should always already exist
    if (index < 0) {
      return;
    }

    const request = {
      code: key.code,
      name: key.name,
      notes: key.notes,
      tags: key.tags
    };

    const updateUrl = `/api/${context.team.slug}/keys/update/${key.id}`;
    try {
      key = await context.fetch(updateUrl, {
        body: JSON.stringify(request),
        method: 'POST'
      });
      toast.success('Key updated successfully!');
    } catch (err) {
      toast.error('Error updating key.');
      throw new Error(); // throw error so modal doesn't close
    }

    // update already existing entry in key
    const updateKey = [...keys];
    updateKey[index].key = key;
    setKeys(updateKey);

    if (props.assetEdited) {
      props.assetEdited('key', props.space ? props.space.id : null, null);
    }

    // TODO: handle count changes once keys are related to spaces
  };

  const deleteKey = async (key: IKey) => {
    if (!confirm('Are you sure you want to delete item?')) {
      return false;
    }
    try {
      await context.fetch(`/api/${context.team.slug}/keys/delete/${key.id}`, {
        method: 'POST'
      });
      toast.success('Key deleted successfully!');
    } catch (err) {
      toast.error('Error deleting key.');
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = keys.findIndex(x => x.id === key.id);
    if (index > -1) {
      const shallowCopy = [...keys];
      shallowCopy.splice(index, 1);
      setKeys(shallowCopy);
    }
  };

  const associateSpace = async (space: ISpace, keyInfo: IKeyInfo) => {
    const { team } = context;

    // possibly create key
    if (keyInfo.id === 0) {
      try {
        keyInfo = await createKey(keyInfo.key);
        toast.success('Key created successfully!');
      } catch (err) {
        toast.error('Error creating key.');
        throw new Error(); // throw error so modal doesn't close
      }
    }

    const request = {
      spaceId: space.id
    };

    const associateUrl = `/api/${team.slug}/keys/associateSpace/${keyInfo.id}`;
    try {
      await context.fetch(associateUrl, {
        body: JSON.stringify(request),
        method: 'POST'
      });
      toast.success('Space associated succesfully!');
    } catch (err) {
      toast.error('Error associating space.');
      throw new Error(); // throw error so modal doesn't close
    }

    // update count here
    keyInfo.spacesCount++;

    const index = keys.findIndex(x => x.id === keyInfo.id);
    if (index !== -1) {
      // update already existing entry in key
      const updateKeys = [...keys];
      updateKeys[index] = keyInfo;
      setKeys(updateKeys);
    } else {
      setKeys(prevKeys => [...prevKeys, keyInfo]);
    }

    if (props.assetTotalUpdated) {
      props.assetTotalUpdated(
        'key',
        props.space ? props.space.id : null,
        null,
        1
      );
    }
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
      toast.success('Space disassociated succesfully!');
    } catch (err) {
      toast.error('Error disassociating space.');
      throw new Error(); // throw error so modal doesn't close
    }

    // update count here
    keyInfo.spacesCount--;
    const updatedKeys = [...keys];
    const index = updatedKeys.findIndex(k => k.id === keyInfo.id);
    updatedKeys.splice(index, 1);
    setKeys(updatedKeys);

    if (props.assetTotalUpdated) {
      props.assetTotalUpdated(
        'key',
        props.space ? props.space.id : null,
        null,
        -1
      );
    }
  };

  // managing counts for assigned or revoked
  const serialInUseUpdated = (keyId: number, count: number) => {
    const index = keys.findIndex(x => x.id === keyId);
    if (index > -1) {
      const newKeys = [...keys];
      keys[index].serialsInUseCount += count;
      setKeys(newKeys);
    }
  };

  const serialTotalUpdated = (keyId: number, count: number) => {
    const index = keys.findIndex(x => x.id === keyId);
    if (index > -1) {
      const newKeys = [...keys];
      keys[index].serialsTotalCount += count;
      setKeys(newKeys);
    }
  };

  const spacesTotalUpdated = (keyId: number, count: number) => {
    const index = keys.findIndex(x => x.id === keyId);
    if (index > -1) {
      const newKeys = [...keys];
      keys[index].spacesCount += count;
      setKeys(newKeys);
    }
  };

  const onTagsFiltered = (tagFilters: string[]) => {
    setTagFilters(tagFilters);
  };

  const onTableFiltered = (tableFilters: any[]) => {
    setTableFilters(tableFilters);
  };

  const openCreateModal = () => {
    const { team } = context;
    history.push(`/${team.slug}/keys/create`);
  };

  const openDetailsModal = (key: IKey) => {
    const { team } = context;
    history.push(`/${team.slug}/keys/details/${key.id}`);
  };

  const openEditModal = (key: IKey) => {
    const { team } = context;
    history.push(`/${team.slug}/keys/edit/${key.id}`);
  };

  const openDeleteModal = (key: IKey) => {
    history.push(`${getBaseUrl()}/keys/delete/${key.id}`);
  };

  const openAssociate = () => {
    history.push(`${getBaseUrl()}/keys/associate`);
  };

  const openDisassociate = (key: IKeyInfo) => {
    history.push(`${getBaseUrl()}/keys/disassociate/${key.id}`);
  };

  const closeModals = () => {
    history.push(`${getBaseUrl()}/keys`);
  };

  const getBaseUrl = () => {
    const { space } = props;
    const slug = context.team.slug;

    if (!!space) {
      return `/${slug}/spaces/details/${space.id}`;
    }

    return `/${slug}`;
  };

  if (!PermissionsUtil.canViewKeys(context.permissions)) {
    return <Denied viewName='Keys' />;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  const { space } = props;
  const { containerAction, containerId, action, id } = params;

  const onSpaceTab = !!space;
  // if on key tab, select using containerId. if on spaces, select using id
  const selectedKeyId = !onSpaceTab
    ? parseInt(containerId, 10)
    : parseInt(id, 10);
  const selectedKeyInfo = keys.find(k => k.id === selectedKeyId);

  const shouldRenderDetailsView = !onSpaceTab && containerAction === 'details';
  const shouldRenderTableView = !shouldRenderDetailsView;

  return (
    <div className='card keys-color'>
      <div className='card-header-keys'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-key fa-xs' /> Keys
          </h2>
          {!onSpaceTab && (
            <CreateKey
              onCreate={createKey}
              onOpenModal={openCreateModal}
              closeModal={closeModals}
              modal={containerAction === 'create'}
              searchableTags={context.tags}
              checkIfKeyCodeIsValid={checkIfKeyCodeIsValid}
            />
          )}
          {onSpaceTab && shouldRenderTableView && (
            <div>
              <Button
                color='link'
                onClick={openAssociate}
                className='keys-anomaly'
              >
                <i className='fas fa-plus fa-sm mr-2' aria-hidden='true' />
                Associate
              </Button>
              {action === 'associate' &&
                renderAssociateModal(selectedKeyId, selectedKeyInfo)}
            </div>
          )}
        </div>
      </div>
      <div className='card-content'>
        {shouldRenderTableView && renderTableOrListView(selectedKeyId)}
        {shouldRenderDetailsView && renderDetailsView()}
        {(containerAction === 'delete' || action === 'delete') &&
          renderDeleteModal(selectedKeyId, selectedKeyInfo)}
      </div>
    </div>
  );
};

export default KeyContainer;
