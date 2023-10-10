import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import { IWorkstation } from '../../models/Workstations';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import AssignWorkstation from '../Workstations/AssignWorkstation';
import EditWorkstation from '../Workstations/EditWorkstation';
import RevokeWorkstation from '../Workstations/RevokeWorkstation';
import WorkstationDetails from '../Workstations/WorkstationDetails';
import WorkstationList from './../Workstations/WorkstationList';
import DeleteWorkstation from './DeleteWorkstation';
import PeaksLoader from '../Shared/PeaksLoader';

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
  person?: IPerson;
  tags: string[];
}

const WorkstationContainer = (props: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [workstations, setWorkstations] = useState<IWorkstation[]>([]);
  const context = useContext(Context);
  const history = useHistory();
  const params: IMatchParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewWorkstations(context.permissions)) {
      return;
    }
    setLoading(true);
    let url = '';
    if (!props.space && !!props.person) {
      url = `/api/${context.team.slug}/workstations/listAssigned?personId=${props.person.id}`;
    } else if (!!props.space && !props.person) {
      url = `/api/${context.team.slug}/workstations/getWorkstationsInSpace?spaceId=${props.space.id}`;
    }

    const fetchWorkstations = async () => {
      let workstationsData = [];
      try {
        workstationsData = await context.fetch(url);
      } catch (err) {
        toast.error(
          'Error loading workstations. Please refresh and try again.'
        );
        return;
      }
      setWorkstations(workstationsData);
      setLoading(false);
    };

    fetchWorkstations();
  }, [context, props.person, props.space]);

  const renderAssignModal = (
    selectedId: number,
    workstation?: IWorkstation
  ) => {
    return (
      <AssignWorkstation
        key={
          selectedId ? `assign-workstation-${selectedId}` : 'create-workstation'
        }
        closeModal={closeModals}
        modal={true}
        person={
          workstation && workstation.assignment
            ? workstation.assignment.person
            : props.person
        }
        selectedWorkstation={workstation}
        tags={props.tags}
        space={props.space}
        onCreate={createAndMaybeAssignWorkstation}
        openEditModal={openEditModal}
        openDetailsModal={openDetailsModal}
        onAddNew={openCreateModal}
      />
    );
  };

  const renderDetailsModal = (
    selectedId: number,
    workstation: IWorkstation
  ) => {
    return (
      <WorkstationDetails
        key={`details-workstation-${selectedId}`}
        closeModal={closeModals}
        modal={!!workstation}
        selectedWorkstation={workstation}
        openEditModal={openEditModal}
        openUpdateModal={openAssignModal}
        updateSelectedWorkstation={updateWorkstationFromDetails}
      />
    );
  };

  const renderEditModal = (selectedId: number, workstation: IWorkstation) => {
    return (
      <EditWorkstation
        key={`edit-workstation-${selectedId}`}
        closeModal={closeModals}
        tags={props.tags}
        modal={!!workstation}
        selectedWorkstation={workstation}
        onEdit={editWorkstation}
        openUpdateModal={openAssignModal}
      />
    );
  };

  const renderRevokeModal = (selectedId: number, workstation: IWorkstation) => {
    return (
      <RevokeWorkstation
        key={`revoke-workstation-${selectedId}`}
        closeModal={closeModals}
        revokeWorkstation={revokeWorkstation}
        modal={!!workstation}
        selectedWorkstation={workstation}
      />
    );
  };

  const renderDeleteModal = (selectedId: number, workstation: IWorkstation) => {
    return (
      <DeleteWorkstation
        key={`delete-workstation-${selectedId}`}
        selectedWorkstation={workstation}
        deleteWorkstation={deleteWorkstation}
        closeModal={closeModals}
        modal={!!workstation}
      />
    );
  };

  const createAndMaybeAssignWorkstation = async (
    person: IPerson,
    workstation: IWorkstation,
    date: any
  ) => {
    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;

    // call API to create a workstation, then assign it if there is a person to assign to
    // if we are creating a new workstation
    if (workstation.id === 0) {
      workstation.teamId = context.team.id;
      try {
        workstation = await context.fetch(
          `/api/${context.team.slug}/workstations/create`,
          {
            body: JSON.stringify(workstation),
            method: 'POST'
          }
        );
        toast.success('Workstation created successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error creating equipment'
            : `Error creating equipment, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }
      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${context.team.slug}/workstations/assign?workstationId=${workstation.id}&personId=${person.id}&date=${date}`;

      if (!workstation.assignment) {
        // only count as assigned if this is a new one
        updateInUseAssetCount = true;
      }
      try {
        workstation = await context.fetch(assignUrl, {
          method: 'POST'
        });
        toast.success('Workstation assigned successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error assigning equipment'
            : `Error assigning equipment, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }
      workstation.assignment.person = person;
    }

    const index = workstations.findIndex(x => x.id === workstation.id);
    if (index !== -1) {
      // update already existing entry in workstation
      const updateWorkstation = [...workstations];
      updateWorkstation[index] = workstation;
      setWorkstations(updateWorkstation);
    } else if (!!props.space && props.space.id !== workstation.space.id) {
      // if we are on the space tab and we have created a workstation that is not in this space, do nothing to our state here
    } else {
      setWorkstations(prevWorkstations => [...prevWorkstations, workstation]);
    }
    if (updateTotalAssetCount && props.assetTotalUpdated) {
      props.assetTotalUpdated(
        'workstation',
        workstation.space ? workstation.space.id : null,
        props.person ? props.person.id : null,
        1
      );
    }
    if (updateInUseAssetCount && props.assetInUseUpdated) {
      props.assetInUseUpdated(
        'workstation',
        workstation.space ? workstation.space.id : null,
        props.person ? props.person.id : null,
        1
      );
    }
  };

  const revokeWorkstation = async (workstation: IWorkstation) => {
    if (!window.confirm('Are you sure you want to revoke workstation?')) {
      return false;
    }
    // call API to actually revoke
    try {
      await context.fetch(
        `/api/${context.team.slug}/workstations/revoke/${workstation.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Successfully revoked workstation!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error revoking equipment'
          : `Error revoking equipment, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = workstations.indexOf(workstation);
    if (index > -1) {
      const shallowCopy = [...workstations];
      if (!props.person && !!props.space) {
        // if we are looking at all workstations, just update assignment
        shallowCopy[index].assignment = null;
      } else {
        // if we are looking at a person, remove from our list of workstations
        shallowCopy.splice(index, 1);
      }
      setWorkstations(shallowCopy);

      if (props.assetInUseUpdated) {
        props.assetInUseUpdated(
          'workstation',
          props.space ? props.space.id : null,
          props.person ? props.person.id : null,
          -1
        );
      }
    }
  };

  const deleteWorkstation = async (workstation: IWorkstation) => {
    if (!window.confirm('Are you sure you want to delete item?')) {
      return false;
    }
    try {
      await context.fetch(
        `/api/${context.team.slug}/workstations/delete/${workstation.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Successfully deleted workstation!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error deleting equipment'
          : `Error deleting equipment, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }
    // remove from state
    const index = workstations.indexOf(workstation);
    if (index > -1) {
      const shallowCopy = [...workstations];
      shallowCopy.splice(index, 1);
      setWorkstations(shallowCopy);

      if (workstation.assignment !== null && props.assetInUseUpdated) {
        props.assetInUseUpdated(
          'workstation',
          props.space ? props.space.id : null,
          props.person ? props.person.id : null,
          -1
        );
      }
      if (props.assetTotalUpdated) {
        props.assetTotalUpdated(
          'workstation',
          props.space ? props.space.id : null,
          props.person ? props.person.id : null,
          -1
        );
      }
    }
  };

  const editWorkstation = async (workstation: IWorkstation) => {
    const index = workstations.findIndex(x => x.id === workstation.id);
    if (index === -1) {
      // should always already exist
      return;
    }
    let updated: IWorkstation = null;
    try {
      updated = await context.fetch(
        `/api/${context.team.slug}/workstations/update`,
        {
          body: JSON.stringify(workstation),
          method: 'POST'
        }
      );
      toast.success('Workstation updated successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error editing equipment'
          : `Error editing equipment, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    updated.assignment = workstation.assignment;

    // update already existing entry in key
    const updateWorkstation = [...workstations];
    updateWorkstation[index] = updated;
    setWorkstations(updateWorkstation);

    if (props.assetEdited) {
      props.assetEdited(
        'workstation',
        props.space ? props.space.id : null,
        props.person ? props.person.id : null
      );
    }
  };

  const updateWorkstationFromDetails = (
    workstation: IWorkstation,
    id?: number
  ) => {
    const workstationId = workstation ? workstation.id : id;
    const index = workstations.findIndex(x => x.id === workstationId);

    if (index === -1) {
      // should always already exist
      return;
    }

    // update already existing entry in key
    const updateWorkstations = [...workstations];
    // if workstation has been deleted elsewhere
    if (workstation == null) {
      updateWorkstations.splice(index, 1);
    } else {
      updateWorkstations[index] = workstation;
    }
    setWorkstations(updateWorkstations);
  };

  const openDetailsModal = (workstation: IWorkstation) => {
    // if we are on spaces or person page, and this workstation is not in our state
    // this happens on the search, when selecting already assigned
    if (workstations.findIndex(x => x.id === workstation.id) === -1) {
      history.push(
        `/${context.team.slug}/spaces/details/${workstation.space.id}/workstations/details/${workstation.id}`
      );
    } else {
      history.push(`${getBaseUrl()}/workstations/details/${workstation.id}`);
    }
  };

  const openEditModal = (workstation: IWorkstation) => {
    history.push(`${getBaseUrl()}/workstations/edit/${workstation.id}`);
  };

  const openAssignModal = (workstation: IWorkstation) => {
    history.push(`${getBaseUrl()}/workstations/assign/${workstation.id}`);
  };

  const openCreateModal = () => {
    history.push(`${getBaseUrl()}/workstations/create/`);
  };

  const openRevokeModal = (workstation: IWorkstation) => {
    history.push(`${getBaseUrl()}/workstations/revoke/${workstation.id}`);
  };

  const closeModals = () => {
    if (!!props.person && !props.space) {
      history.push(`${getBaseUrl()}`);
    } else if (!props.person && !!props.space) {
      history.push(`${getBaseUrl()}`);
    }
  };

  const getBaseUrl = () => {
    return props.person
      ? `/${context.team.slug}/people/details/${props.person.id}`
      : `/${context.team.slug}/spaces/details/${props.space.id}`;
  };

  if (!PermissionsUtil.canViewWorkstations(context.permissions)) {
    return <Denied viewName='Workstations' />;
  }
  if (!props.space && !props.person) {
    return null;
  }
  if (loading) {
    return <PeaksLoader />;
  }
  const { action, assetType, id } = params;
  const activeAsset = assetType === 'workstations';
  const selectedId = parseInt(id, 10);
  const selectedWorkstation = workstations.find(k => k.id === selectedId);

  return (
    <div className='card spaces-color'>
      <div className='card-header-spaces'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-briefcase fa-xs' /> Workstations
          </h2>
          <Button color='link' onClick={() => openCreateModal()}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add
            Workstation
          </Button>
        </div>
      </div>
      <div className='card-content'>
        <WorkstationList
          workstations={workstations}
          showDetails={openDetailsModal}
          onEdit={openEditModal}
          onAdd={openAssignModal}
          onCreate={openCreateModal}
          onDelete={deleteWorkstation}
          onRevoke={openRevokeModal}
        />

        {activeAsset &&
          (action === 'assign' || action === 'create') &&
          renderAssignModal(selectedId, selectedWorkstation)}
        {activeAsset &&
          action === 'details' &&
          renderDetailsModal(selectedId, selectedWorkstation)}
        {activeAsset &&
          action === 'edit' &&
          renderEditModal(selectedId, selectedWorkstation)}
        {activeAsset &&
          action === 'revoke' &&
          renderRevokeModal(selectedId, selectedWorkstation)}
        {activeAsset &&
          action === 'delete' &&
          renderDeleteModal(selectedId, selectedWorkstation)}
      </div>
    </div>
  );
};

export default WorkstationContainer;
