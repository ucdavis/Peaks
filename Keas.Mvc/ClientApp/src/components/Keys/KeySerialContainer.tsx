import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import AssignKeySerial from './AssignKeySerial';
import EditKeySerial from './EditKeySerial';
import KeySerialDetails from './KeySerialDetails';
import KeySerialList from './KeySerialList';
import KeySerialTable from './KeySerialTable';
import RevokeKeySerial from './RevokeKeySerial';
import PeaksLoader from '../Shared/PeaksLoader';

interface IProps {
  selectedPerson?: IPerson;
  selectedKey?: IKey;
  assetInUseUpdated?: (
    type: string,
    keySerialId: number,
    personId: number,
    count: number
  ) => void;
  assetTotalUpdated?: (
    type: string,
    keySerialId: number,
    personId: number,
    count: number
  ) => void;
  assetEdited?: (type: string, keySerialId: number, personId: number) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
}

const KeySerialContainer = (props: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [keySerials, setKeySerials] = useState<IKeySerial[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const context = useContext(Context);
  const history = useHistory();
  const params: IMatchParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewKeys(context.permissions)) {
      return;
    }
    const { selectedPerson, selectedKey } = props;

    // are we getting the person's key or the team's?
    let keyFetchUrl = '';
    if (!!selectedPerson) {
      keyFetchUrl = `/api/${context.team.slug}/keySerials/getforperson?personid=${selectedPerson.id}`;
    } else if (!!selectedKey) {
      keyFetchUrl = `/api/${context.team.slug}/keySerials/getforkey?keyid=${selectedKey.id}`;
    } else {
      keyFetchUrl = `/api/${context.team.slug}/keySerials/list/`;
    }

    const statusListFetchUrl = `/api/${context.team.slug}/keySerials/ListKeySerialStatus/`;

    const fetchKeySerials = async () => {
      let newKeySerials: IKeySerial[] = null;
      try {
        newKeySerials = await context.fetch(keyFetchUrl);
      } catch (err) {
        toast.error(
          'Failed to fetch key serials. Please refresh the page to try again.'
        );
        return;
      }
      const statusList = await context.fetch(statusListFetchUrl);
      setStatusList(statusList);
      setKeySerials(newKeySerials);
      setLoading(false);
    };

    fetchKeySerials();
  }, [context, props]);

  const renderAssignModal = (selectedId: number, keySerial: IKeySerial) => {
    return (
      <AssignKeySerial
        key={selectedId ? `assign-keySerial-${selectedId}` : 'create-keySerial'}
        person={props.selectedPerson}
        selectedKey={props.selectedKey}
        selectedKeySerial={keySerial}
        checkIfKeySerialNumberIsValid={checkIfKeySerialNumberIsValid}
        onCreate={createAndMaybeAssignKey}
        isModalOpen={true}
        onOpenModal={openCreateModal}
        closeModal={closeModals}
        openEditModal={openEditModal}
        openDetailsModal={openDetailsModal}
        statusList={statusList}
        goToKeyDetails={props.goToKeyDetails}
      />
    );
  };

  const renderDetailsModal = (selectedId: number, keySerial: IKeySerial) => {
    return (
      <KeySerialDetails
        key={`details-keySerial-${selectedId}`}
        selectedKeySerial={keySerial}
        isModalOpen={!!keySerial}
        closeModal={closeModals}
        openEditModal={openEditModal}
        openUpdateModal={openUpdateModal}
        updateSelectedKeySerial={updateKeySerialsFromDetails}
        goToKeyDetails={props.goToKeyDetails}
      />
    );
  };

  const renderEditModal = (selectedId: number, keySerial: IKeySerial) => {
    return (
      <EditKeySerial
        key={`edit-keySerial-${selectedId}`}
        selectedKeySerial={keySerial}
        statusList={statusList}
        isModalOpen={!!keySerial}
        onEdit={editKeySerial}
        openUpdateModal={openUpdateModal}
        closeModal={closeModals}
        goToKeyDetails={props.goToKeyDetails}
        checkIfKeySerialNumberIsValid={checkIfKeySerialNumberIsValid}
      />
    );
  };

  const renderRevokeModal = (selectedId: number, keySerial: IKeySerial) => {
    return (
      <RevokeKeySerial
        key={`revoke-keySerial-${selectedId}`}
        selectedKeySerial={keySerial}
        isModalOpen={!!keySerial}
        closeModal={closeModals}
        openEditModal={openEditModal}
        openUpdateModal={openUpdateModal}
        updateSelectedKeySerial={updateKeySerialsFromDetails}
        onRevoke={revokeKeySerial}
        goToKeyDetails={props.goToKeyDetails}
      />
    );
  };

  const createAndMaybeAssignKey = async (
    person: IPerson,
    keySerial: IKeySerial,
    date: any
  ) => {
    const { team } = context;

    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;

    // if we are creating a new key serial
    if (keySerial.id === 0) {
      const request = {
        keyId: keySerial.key.id,
        notes: keySerial.notes,
        number: keySerial.number,
        status: keySerial.status
      };

      const createUrl = `/api/${team.slug}/keyserials/create`;
      try {
        keySerial = await context.fetch(createUrl, {
          body: JSON.stringify(request),
          method: 'POST'
        });
        toast.success('Key serial created successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error creating key serial'
            : `Error creating key serial, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }

      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (!!person) {
      if (!keySerial.keySerialAssignment) {
        // don't count as assigning unless this is a new one
        updateInUseAssetCount = true;
      }

      const request = {
        expiresAt: date,
        keySerialId: keySerial.id,
        personId: person.id
      };

      const assignUrl = `/api/${team.slug}/keyserials/assign`;
      try {
        keySerial = await context.fetch(assignUrl, {
          body: JSON.stringify(request),
          method: 'POST'
        });
        toast.success('Key serial assigned successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error assigning key serial'
            : `Error assigning key serial, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }

      keySerial.keySerialAssignment.person = person;
    }

    const index = keySerials.findIndex(x => x.id === keySerial.id);
    const updateKeySerials = [...keySerials];
    if (index < 0) {
      updateKeySerials.push(keySerial);
    } else {
      // update already existing entry in key
      updateKeySerials[index] = keySerial;
    }
    setKeySerials(updateKeySerials);

    if (updateTotalAssetCount && props.assetTotalUpdated) {
      props.assetTotalUpdated(
        'serial',
        null,
        props.selectedPerson ? props.selectedPerson.id : null,
        1
      );
    }

    if (updateInUseAssetCount && props.assetInUseUpdated) {
      props.assetInUseUpdated(
        'serial',
        null,
        props.selectedPerson ? props.selectedPerson.id : null,
        1
      );
    }
  };

  const revokeKeySerial = async (keySerial: IKeySerial) => {
    if (!window.confirm('Are you sure you want to revoke item?')) {
      return false;
    }

    const { team } = context;

    // call API to actually revoke
    const revokeUrl = `/api/${team.slug}/keyserials/revoke/${keySerial.id}`;
    try {
      keySerial = await context.fetch(revokeUrl, {
        method: 'POST'
      });
      toast.success('Key serial revoked successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error revoking key serial'
          : `Error revoking key serial, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }
    // should we remove from state
    const index = keySerials.findIndex(k => k.id === keySerial.id);
    if (index > -1) {
      const shallowCopy = [...keySerials];

      if (!props.selectedPerson) {
        // if we are looking at all key, just update assignment
        shallowCopy[index] = keySerial;
      } else {
        // if we are looking at a person, remove from our list of key
        shallowCopy.splice(index, 1);
      }

      setKeySerials(shallowCopy);

      if (props.assetInUseUpdated) {
        props.assetInUseUpdated(
          'serial',
          null,
          props.selectedPerson ? props.selectedPerson.id : null,
          -1
        );
      }
    }
  };

  const editKeySerial = async (keySerial: IKeySerial) => {
    const { team } = context;

    const index = keySerials.findIndex(x => x.id === keySerial.id);

    // should always already exist
    if (index < 0) {
      return;
    }

    const request = {
      notes: keySerial.notes,
      number: keySerial.number,
      status: keySerial.status
    };

    const updateUrl = `/api/${team.slug}/keyserials/update/${keySerial.id}`;
    try {
      keySerial = await context.fetch(updateUrl, {
        body: JSON.stringify(request),
        method: 'POST'
      });
      toast.success('Key serial updated successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error editing key serial'
          : `Error editing key serial, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    // update already existing entry in key
    const updateKeySerials = [...keySerials];
    updateKeySerials[index] = keySerial;
    setKeySerials(updateKeySerials);
    // if(props.assetEdited) {
    //   props.assetEdited("key", props.space ? props.space.id : null,
    //     props.person ? props.person.id : null);
    // }

    // TODO: handle count changes once keys are related to spaces
  };

  const updateKeySerialsFromDetails = (keySerial: IKeySerial, id?: number) => {
    const keySerialId = keySerial ? keySerial.id : id;
    const index = keySerials.findIndex(x => x.id === keySerialId);

    if (index === -1) {
      // should always already exist
      return;
    }

    // update already existing entry in key
    const updateKeySerials = [...keySerials];
    // if key serial has been deleted elsewhere
    if (keySerial === null) {
      updateKeySerials.splice(index, 1);
    } else {
      updateKeySerials[index] = keySerial;
    }

    setKeySerials(updateKeySerials);
  };

  const checkIfKeySerialNumberIsValid = (
    keyId: number,
    keySerialNumber: string,
    id: number
  ) => {
    return !keySerials.some(
      x => x.number === keySerialNumber && x.id !== id && x.keyId === keyId
    );
  };

  const openAssignModal = (keySerial: IKeySerial) => {
    history.push(`${getBaseUrl()}/keyserials/assign/${keySerial.id}`);
  };

  const openCreateModal = () => {
    history.push(`${getBaseUrl()}/keyserials/create`);
  };

  const openDetailsModal = (keySerial: IKeySerial) => {
    // if we are on person page, and this serial is not in our state
    // this happens on the search, when selecting already assigned
    if (keySerials.findIndex(x => x.id === keySerial.id) === -1) {
      history.push(
        `/${context.team.slug}/keys/details/${keySerial.key.id}/keyserials/details/${keySerial.id}`
      );
    } else {
      history.push(`${getBaseUrl()}/keyserials/details/${keySerial.id}`);
    }
  };

  const openRevokeModal = (keySerial: IKeySerial) => {
    history.push(`${getBaseUrl()}/keyserials/revoke/${keySerial.id}`);
  };

  const openEditModal = (keySerial: IKeySerial) => {
    history.push(`${getBaseUrl()}/keyserials/edit/${keySerial.id}`);
  };

  const openUpdateModal = (keySerial: IKeySerial) => {
    history.push(`${getBaseUrl()}/keyserials/update/${keySerial.id}`);
  };

  const closeModals = () => {
    history.push(`${getBaseUrl()}`);
  };

  const getBaseUrl = () => {
    const { selectedPerson, selectedKey } = props;
    const slug = context.team.slug;

    if (!!selectedPerson) {
      return `/${slug}/people/details/${selectedPerson.id}`;
    }

    if (!!selectedKey) {
      return `/${slug}/keys/details/${selectedKey.id}`;
    }

    return `/${slug}`;
  };

  if (!PermissionsUtil.canViewKeys(context.permissions)) {
    return <Denied viewName='Keys' />;
  }

  if (loading) {
    return <PeaksLoader />;
  }

  const { action, assetType, id } = params;
  const activeAsset = !assetType || assetType === 'keyserials';
  const selectedKeySerialId = parseInt(id, 10);
  const selectedKeySerial = keySerials.find(s => s.id === selectedKeySerialId);
  return (
    <div className='card keys-color'>
      <div className='card-header-keys'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-key fa-xs' /> Key Serials
          </h2>
          <Button color='link' onClick={openCreateModal}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Key
            Serial
          </Button>
        </div>
      </div>
      <div className='card-content'>
        {props.selectedPerson && !props.selectedKey && (
          <KeySerialList
            keySerials={keySerials}
            onRevoke={openRevokeModal}
            onAssign={openAssignModal}
            onEdit={openEditModal}
            onUpdate={openUpdateModal}
            showDetails={openDetailsModal}
          />
        )}
        {!props.selectedPerson && props.selectedKey && (
          <KeySerialTable
            keySerials={keySerials}
            onRevoke={openRevokeModal}
            onAssign={openAssignModal}
            onEdit={openEditModal}
            onUpdate={openUpdateModal}
            showDetails={openDetailsModal}
          />
        )}
        {activeAsset &&
          (action === 'create' || action === 'assign' || action === 'update') &&
          renderAssignModal(selectedKeySerialId, selectedKeySerial)}
        {activeAsset &&
          action === 'details' &&
          renderDetailsModal(selectedKeySerialId, selectedKeySerial)}
        {activeAsset &&
          action === 'edit' &&
          renderEditModal(selectedKeySerialId, selectedKeySerial)}
        {activeAsset &&
          action === 'revoke' &&
          renderRevokeModal(selectedKeySerialId, selectedKeySerial)}
      </div>
    </div>
  );
};

export default KeySerialContainer;
