import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IEquipment } from '../../models/Equipment';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { ISpace, ISpaceShort } from '../../models/Spaces';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import AssignEquipment from './AssignEquipment';
import DeleteEquipment from './DeleteEquipment';
import EditEquipment from './EditEquipment';
import EquipmentDetails from './EquipmentDetails';
import EquipmentList from './EquipmentList';
import EquipmentTableContainer from './EquipmentTableContainer';
import RevokeEquipment from './RevokeEquipment';

interface IProps {
  person?: IPerson;
  space?: ISpace;
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
}

const EquipmentContainer = (props: IProps): JSX.Element => {
  const [commonAttributeKeys, setCommonAttributeKeys] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<IEquipment[]>([]);
  const [equipmentAvailabilityLevels] = useState<string[]>([
    'A1',
    'A2',
    'A3',
    'A4'
  ]);
  const [equipmentProtectionLevels] = useState<string[]>([
    'P1',
    'P2',
    'P3',
    'P4'
  ]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [teamSpaces, setTeamSpaces] = useState<ISpaceShort[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(Context);
  const history = useHistory();
  const params: IMatchParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewEquipment(context.permissions)) {
      return;
    }
    // are we getting the person's equipment or the team's?
    let equipmentFetchUrl = '';
    if (props.person) {
      equipmentFetchUrl = `/api/${context.team.slug}/equipment/listassigned?personid=${props.person.id}`;
    } else if (props.space) {
      equipmentFetchUrl = `/api/${context.team.slug}/equipment/getEquipmentInSpace?spaceId=${props.space.id}`;
    } else {
      equipmentFetchUrl = `/api/${context.team.slug}/equipment/list/`;
    }

    const fetchEquipment = async () => {
      let newEquipment: IEquipment[] = null;
      try {
        newEquipment = await context.fetch(equipmentFetchUrl);
      } catch (e) {
        toast.error(
          'Failed to fetch equipment. Please refresh the page to try again.'
        );
        return;
      }
      setEquipment(newEquipment);
      setLoading(false);
    };

    // TODO: move all this into context
    const attrFetchUrl = `/api/${context.team.slug}/equipment/commonAttributeKeys/`;
    const equipmentTypeFetchUrl = `/api/${context.team.slug}/equipment/ListEquipmentTypes/`;
    const teamSpacesFetchUrl = `/api/${context.team.slug}/spaces/shortlist`;

    const fetchAttributeKeys = async () => {
      const commonAttributeKeys = await context.fetch(attrFetchUrl);
      setCommonAttributeKeys(commonAttributeKeys);
    };

    const fetchEquipmentTypes = async () => {
      const equipmentTypes = await context.fetch(equipmentTypeFetchUrl);
      setEquipmentTypes(equipmentTypes);
    };

    const fetchTeamSpaces = async () => {
      const teamSpaces = await context.fetch(teamSpacesFetchUrl);
      setTeamSpaces(teamSpaces);
    };

    fetchAttributeKeys();
    fetchEquipmentTypes();
    fetchEquipment();
    if (!props.space && !props.person) {
      // if we are on a space or a person, we don't need to be able to filter on space
      // or: we only filter on spaces on the table view
      fetchTeamSpaces();
    }
  }, [context, props.person, props.space]);

  if (!PermissionsUtil.canViewEquipment(context.permissions)) {
    return <Denied viewName='Equipment' />;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  const { action, assetType, id } = params;
  const activeAsset = !assetType || assetType === 'equipment';
  const selectedId = parseInt(id, 10);
  const detailEquipment = equipment.find(e => e.id === selectedId);

  const renderTableOrList = () => {
    if (!!props.person || !!props.space) {
      return (
        <div>
          <EquipmentList
            equipment={equipment}
            onRevoke={openRevokeModal}
            onDelete={openDeleteModal}
            onAdd={openAssignModal}
            showDetails={openDetailsModal}
            onEdit={openEditModal}
          />
          {props.person && (
            <a
              href={`/${context.team.slug}/Report/PersonEquipmentHistoryReport/${props.person.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              View Equipment History for {props.person.name}
            </a>
          )}
        </div>
      );
    } else {
      return (
        <div>
          <EquipmentTableContainer
            equipment={equipment}
            equipmentAvailabilityLevels={equipmentAvailabilityLevels}
            equipmentProtectionLevels={equipmentProtectionLevels}
            equipmentTypes={equipmentTypes}
            teamSpaces={teamSpaces}
            tags={context.tags}
            openRevokeModal={openRevokeModal}
            openDeleteModal={openDeleteModal}
            openAssignModal={openAssignModal}
            openDetailsModal={openDetailsModal}
            openEditModal={openEditModal}
          />
        </div>
      );
    }
  };

  const renderAssignModal = (selectedId: number, equipment?: IEquipment) => {
    return (
      <AssignEquipment
        key={selectedId ? `assign-equipment-${selectedId}` : 'create-equipment'}
        onCreate={createAndMaybeAssignEquipment}
        modal={true}
        onAddNew={openCreateModal}
        closeModal={closeModals}
        selectedEquipment={equipment}
        person={props.person}
        space={props.space}
        tags={context.tags}
        commonAttributeKeys={commonAttributeKeys}
        openDetailsModal={openDetailsModal}
        openEditModal={openEditModal}
        equipmentTypes={equipmentTypes}
      />
    );
  };

  const renderDetailsModal = (selectedId: number, equipment: IEquipment) => {
    return (
      <EquipmentDetails
        key={`details-equipment-${selectedId}`}
        selectedEquipment={equipment}
        modal={!!equipment}
        closeModal={closeModals}
        openEditModal={openEditModal}
        openUpdateModal={openAssignModal}
        updateSelectedEquipment={updateEquipmentFromDetails}
      />
    );
  };

  const renderEditModal = (selectedId: number, equipment: IEquipment) => {
    return (
      <EditEquipment
        key={`edit-equipment-${selectedId}`}
        selectedEquipment={equipment}
        onEdit={editEquipment}
        closeModal={closeModals}
        openUpdateModal={openAssignModal}
        modal={!!equipment}
        tags={context.tags}
        space={props.space}
        commonAttributeKeys={commonAttributeKeys}
        equipmentTypes={equipmentTypes}
      />
    );
  };

  const renderRevokeModal = (selectedId: number, equipment: IEquipment) => {
    return (
      <RevokeEquipment
        key={`revoke-equipment-${selectedId}`}
        selectedEquipment={equipment}
        revokeEquipment={revokeEquipment}
        closeModal={closeModals}
        openEditModal={openEditModal}
        openUpdateModal={openAssignModal}
        modal={!!equipment}
      />
    );
  };

  const renderDeleteModal = (selectedId: number, equipment: IEquipment) => {
    return (
      <DeleteEquipment
        key={`delete-equipment-${selectedId}`}
        selectedEquipment={equipment}
        deleteEquipment={deleteEquipment}
        closeModal={closeModals}
        openEditModal={openEditModal}
        openUpdateModal={openAssignModal}
        modal={!!equipment}
      />
    );
  };

  const createAndMaybeAssignEquipment = async (
    person: IPerson,
    selectedEquipment: IEquipment,
    date: any
  ) => {
    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;

    const attributes = selectedEquipment.attributes;
    // call API to create a equipment, then assign it if there is a person to assign to
    // if we are creating a new equipment
    if (selectedEquipment.id === 0) {
      selectedEquipment.teamId = context.team.id;
      try {
        selectedEquipment = await context.fetch(
          `/api/${context.team.slug}/equipment/create`,
          {
            body: JSON.stringify(selectedEquipment),
            method: 'POST'
          }
        );
        toast.success('Equipment created successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error creating equipment'
            : `Error creating equipment, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }
      selectedEquipment.attributes = attributes;
      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${context.team.slug}/equipment/assign?equipmentId=${selectedEquipment.id}&personId=${person.id}&date=${date}`;

      if (!selectedEquipment.assignment) {
        // don't count as assigning unless this is a new one
        updateInUseAssetCount = true;
      }
      try {
        selectedEquipment = await context.fetch(assignUrl, {
          method: 'POST'
        });
        toast.success('Equipment assigned successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error assigning equipment'
            : `Error assigning equipment, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }
      selectedEquipment.attributes = attributes;
      selectedEquipment.assignment.person = person;
    }

    const index = equipment.findIndex(x => x.id === selectedEquipment.id);
    if (index !== -1) {
      // update already existing entry in equipment
      const updateEquipment = [...equipment];
      updateEquipment[index] = selectedEquipment;
      setEquipment(updateEquipment);
    } else if (
      !!props.space &&
      !!selectedEquipment.space &&
      props.space.id !== selectedEquipment.space.id
    ) {
      // if we are on the space tab and we have assigned/created an equipment that is not in this space, do nothing to our state here
    } else {
      const updateEquipment = [...equipment];
      updateEquipment.push(selectedEquipment);
      setEquipment(updateEquipment);
    }

    if (updateTotalAssetCount && props.assetTotalUpdated) {
      props.assetTotalUpdated(
        'equipment',
        props.space ? props.space.id : null,
        props.person ? props.person.id : null,
        1
      );
    }

    if (updateInUseAssetCount && props.assetInUseUpdated) {
      props.assetInUseUpdated(
        'equipment',
        props.space ? props.space.id : null,
        props.person ? props.person.id : null,
        1
      );
    }
  };

  const revokeEquipment = async (selectedEquipment: IEquipment) => {
    if (!window.confirm('Are you sure you want to revoke item?')) {
      return false;
    }
    // call API to actually revoke
    try {
      await context.fetch(
        `/api/${context.team.slug}/equipment/revoke/${selectedEquipment.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Equipment revoked successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error revoking equipment'
          : `Error revoking equipment, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = equipment.indexOf(selectedEquipment);
    if (index > -1) {
      const shallowCopy = [...equipment];
      if (!props.person) {
        // if we are looking at all equipment, just update assignment
        shallowCopy[index].assignment = null;
        shallowCopy[index].equipmentAssignmentId = null;
      } else {
        // if we are looking at a person, remove from our list of equipment
        shallowCopy.splice(index, 1);
      }
      setEquipment(shallowCopy);
      if (props.assetInUseUpdated) {
        props.assetInUseUpdated(
          'equipment',
          props.space ? props.space.id : null,
          props.person ? props.person.id : null,
          -1
        );
      }
    }
  };

  const deleteEquipment = async (selectedEquipment: IEquipment) => {
    if (!window.confirm('Are you sure you want to delete item?')) {
      return false;
    }

    try {
      await context.fetch(
        `/api/${context.team.slug}/equipment/delete/${selectedEquipment.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Equipment deleted successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error deleting equipment'
          : `Error deleting equipment, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = equipment.indexOf(selectedEquipment);
    if (index > -1) {
      const shallowCopy = [...equipment];
      shallowCopy.splice(index, 1);
      setEquipment(shallowCopy);

      if (selectedEquipment.assignment !== null && props.assetInUseUpdated) {
        props.assetInUseUpdated(
          'equipment',
          props.space ? props.space.id : null,
          props.person ? props.person.id : null,
          -1
        );
      }
      if (props.assetTotalUpdated) {
        props.assetTotalUpdated(
          'equipment',
          props.space ? props.space.id : null,
          props.person ? props.person.id : null,
          -1
        );
      }
    }
  };

  const editEquipment = async (selectedEquipment: IEquipment) => {
    const index = equipment.findIndex(x => x.id === selectedEquipment.id);

    if (index === -1) {
      // should always already exist
      return;
    }

    let updated: IEquipment = null;
    try {
      updated = await context.fetch(
        `/api/${context.team.slug}/equipment/update`,
        {
          body: JSON.stringify(selectedEquipment),
          method: 'POST'
        }
      );
      toast.success('Equipment updated successfully!');
    } catch (e) {
      const errorMessage =
        e.message === ''
          ? 'Error editing equipment'
          : `Error editing equipment, ${e.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    updated.assignment = selectedEquipment.assignment;

    // update already existing entry in key
    const updateEquipment = [...equipment];
    updateEquipment[index] = updated;

    // if on space tab and the space has been edited
    if (
      !!props.space &&
      selectedEquipment.space.id !== equipment[index].space.id
    ) {
      // remove one from total of old space
      props.assetTotalUpdated(
        'equipment',
        equipment[index].space.id,
        props.person ? props.person.id : null,
        -1
      );
      // remove from this state
      updateEquipment.splice(index, 1);
      // and add one to total of new space
      props.assetTotalUpdated(
        'equipment',
        selectedEquipment.space.id,
        props.person ? props.person.id : null,
        1
      );
    }

    setEquipment(updateEquipment);

    if (props.assetEdited) {
      props.assetEdited(
        'equipment',
        props.space ? props.space.id : null,
        props.person ? props.person.id : null
      );
    }
  };

  const updateEquipmentFromDetails = (
    selectedEquipment: IEquipment,
    id?: number
  ) => {
    const equipmentId = selectedEquipment ? selectedEquipment.id : id;
    const index = equipment.findIndex(x => x.id === equipmentId);

    if (index === -1) {
      // should always already exist
      return;
    }

    // update already existing entry in key
    const updateEquipment = [...equipment];
    // if equipment has been deleted elsewhere
    if (equipment === null) {
      updateEquipment.splice(index, 1);
    } else {
      updateEquipment[index] = selectedEquipment;
    }

    setEquipment(updateEquipment);
  };

  const openAssignModal = (selectedEquipment: IEquipment) => {
    history.push(`${getBaseUrl()}/equipment/assign/${selectedEquipment.id}`);
  };

  const openCreateModal = () => {
    history.push(`${getBaseUrl()}/equipment/create`);
  };

  const openDetailsModal = (selectedEquipment: IEquipment) => {
    // if we are on spaces page, and this equipment is not assigned to this space
    // this happens on the search
    if (equipment.findIndex(x => x.id === selectedEquipment.id) === -1) {
      history.push(
        `/${context.team.slug}/equipment/details/${selectedEquipment.id}`
      );
    } else {
      history.push(`${getBaseUrl()}/equipment/details/${selectedEquipment.id}`);
    }
  };

  const openEditModal = (equipment: IEquipment) => {
    history.push(`${getBaseUrl()}/equipment/edit/${equipment.id}`);
  };

  const openRevokeModal = (equipment: IEquipment) => {
    history.push(`${getBaseUrl()}/equipment/revoke/${equipment.id}`);
  };

  const openDeleteModal = (equipment: IEquipment) => {
    history.push(`${getBaseUrl()}/equipment/delete/${equipment.id}`);
  };

  const closeModals = () => {
    history.push(`${getBaseUrl()}/equipment`);
  };

  const getBaseUrl = () => {
    if (props.person) {
      return `/${context.team.slug}/people/details/${props.person.id}`;
    } else if (props.space) {
      return `/${context.team.slug}/spaces/details/${props.space.id}`;
    } else {
      return `/${context.team.slug}`;
    }
  };

  return (
    <div className='card equipment-color'>
      <div className='card-header-equipment'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-hdd fa-xs' /> Equipment
          </h2>
          <Button color='link' onClick={openCreateModal}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Equipment
          </Button>
        </div>
      </div>
      <div className='card-content'>
        {renderTableOrList()}
        {activeAsset &&
          (action === 'assign' || action === 'create') &&
          renderAssignModal(selectedId, detailEquipment)}
        {activeAsset &&
          action === 'details' &&
          renderDetailsModal(selectedId, detailEquipment)}
        {activeAsset &&
          action === 'edit' &&
          renderEditModal(selectedId, detailEquipment)}
        {activeAsset &&
          action === 'revoke' &&
          renderRevokeModal(selectedId, detailEquipment)}
        {activeAsset &&
          action === 'delete' &&
          renderDeleteModal(selectedId, detailEquipment)}
      </div>
    </div>
  );
};

export default EquipmentContainer;
