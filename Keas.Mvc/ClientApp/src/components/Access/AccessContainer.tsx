import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import AccessDetails from './AccessDetails';
import AccessTable from './AccessTable';
import AssignAccess from './AssignAccess';
import DeleteAccess from './DeleteAccess';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

const AccessContainer = () => {
  const [accesses, setAccesses] = useState<IAccess[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(Context);
  const history = useHistory();
  const params: IMatchParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewAccess(context.permissions)) {
      return;
    }

    const fetchAccesses = async () => {
      const accessFetchUrl = `/api/${context.team.slug}/access/list/`;
      let accessesData: IAccess[] = null;
      try {
        accessesData = await context.fetch(accessFetchUrl);
      } catch (err) {
        toast.error('Error loading access list. Please refresh and try again.');
      }

      accessesData = accessesData.map(a => ({
        ...a,
        assignments: a.assignments.map(assignment => ({
          ...assignment,
          access: a
        }))
      }));

      setAccesses(accessesData);
      setLoading(false);
    };

    fetchAccesses();
  }, [context]);

  const createAndMaybeAssignAccess = async (
    access: IAccess,
    date?: any,
    person?: IPerson
  ) => {
    const accessesData = accesses;
    if (access.id === 0) {
      try {
        access = await context.fetch(
          `/api/${context.team.slug}/access/create`,
          {
            body: JSON.stringify({
              ...access,
              teamId: context.team.id
            }),
            method: 'POST'
          }
        );
        accessesData.push(access);
        setAccesses(accessesData);
        toast.success('Access created successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error creating access'
            : `Error creating access, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }
    }
    if (person && date) {
      const assignUrl = `/api/${context.team.slug}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;
      let accessAssignment: IAccessAssignment = null;
      try {
        accessAssignment = await context.fetch(assignUrl, {
          method: 'POST'
        });

        const newAccess = accesses.find(a => a.id === access.id);
        accessAssignment.access = newAccess;
        newAccess.assignments.push(accessAssignment);
        setAccesses(accesses);
        toast.success('Access assigned successfully!');
      } catch (err) {
        const errorMessage =
          err.message === ''
            ? 'Error assigning access'
            : `Error assigning access, ${err.message}`;
        toast.error(errorMessage);
        throw new Error(); // throw error so modal doesn't close
      }
    }
  };

  const renderAssignModal = (selectedId: number, access?: IAccess) => {
    return (
      <AssignAccess
        key={`assign-access-${selectedId}`}
        onCreate={createAndMaybeAssignAccess}
        modal={true}
        closeModal={closeModals}
        selectedAccess={access}
        tags={context.tags}
      />
    );
  };

  const renderTable = () => {
    let filteredAccess = accesses;
    if (tagFilters.length > 0) {
      filteredAccess = filteredAccess.filter(x =>
        checkTagFilters(x, tagFilters)
      );
    }
    return (
      <div>
        <div className='row'>
          <SearchDefinedOptions
            definedOptions={context.tags}
            selected={tagFilters}
            onSelect={filterTags}
            disabled={false}
            placeholder='Search for Tags'
            id='searchTagsAccess'
          />
        </div>
        <AccessTable
          accesses={filteredAccess}
          onDelete={openDeleteModal}
          onAdd={openAssignModal}
          onEdit={openEditModal}
          showDetails={openDetails}
        />
      </div>
    );
  };

  const renderDetails = (selectedId: number, access: IAccess) => {
    return (
      <AccessDetails
        goBack={() => history.push(getBaseUrl() + '/access')}
        key={`details-access-${selectedId}`}
        selectedAccess={access}
        modal={!!access}
        closeModal={closeModals}
        editAccess={editAccess}
        openDeleteModal={openDeleteModal}
        updateSelectedAccess={updateAccessFromDetails}
      />
    );
  };

  const renderDeleteModal = (selectedId: number, access: IAccess) => {
    return (
      <DeleteAccess
        key={`delete-access-${selectedId}`}
        selectedAccess={access}
        closeModal={closeModals}
        deleteAccess={deleteAccess}
        modal={!!access}
      />
    );
  };

  const filterTags = (filters: string[]) => {
    setTagFilters(filters);
  };

  const checkTagFilters = (access: IAccess, filters: string[]) => {
    return filters.every(f => !!access.tags && access.tags.includes(f));
  };

  const deleteAccess = async (access: IAccess) => {
    if (!confirm('Are you sure you want to delete item?')) {
      return false;
    }
    try {
      await context.fetch(
        `/api/${context.team.slug}/access/delete/${access.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Access deleted successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error deleting access'
          : `Error deleting access, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = accesses.indexOf(access);
    if (index > -1) {
      const shallowCopy = [...accesses];
      shallowCopy.splice(index, 1);
      setAccesses(shallowCopy);
    }
  };

  const editAccess = async (access: IAccess) => {
    const index = accesses.findIndex(x => x.id === access.id);

    if (index === -1) {
      // should always already exist
      return;
    }

    let updated: IAccess = null;
    try {
      updated = await context.fetch(`/api/${context.team.slug}/access/update`, {
        body: JSON.stringify(access),
        method: 'POST'
      });
      toast.success('Access edited successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error editing access'
          : `Error editing access, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    // update already existing entry in key
    const updateAccesses = [...accesses];
    updateAccesses[index] = updated;
    setAccesses(updateAccesses);
  };

  const updateAccessFromDetails = (access: IAccess, id?: number) => {
    const accessId = access ? access.id : id;
    const index = accesses.findIndex(x => x.id === accessId);

    if (index === -1) {
      // should always already exist
      return;
    }

    // update already existing entry in key
    const updateAccesses = [...accesses];
    // if access has been deleted elsewhere
    if (access === null) {
      updateAccesses.splice(index, 1);
    } else {
      updateAccesses[index] = access;
    }
    setAccesses(updateAccesses);
  };

  const openAssignModal = (access: IAccess) => {
    history.push(
      `${getBaseUrl()}/access/details/${access.id}/assign/${access.id}`
    );
  };

  const openCreateModal = () => {
    history.push(`${getBaseUrl()}/access/create`);
  };

  const openDetails = (access: IAccess) => {
    history.push(`${getBaseUrl()}/access/details/${access.id}`);
  };

  const openEditModal = (access: IAccess) => {
    history.push(`${getBaseUrl()}/access/edit/${access.id}`);
  };

  const openDeleteModal = (access: IAccess) => {
    history.push(`${getBaseUrl()}/access/delete/${access.id}`);
  };

  const closeModals = () => {
    history.push(`${getBaseUrl()}/access`);
  };

  const getBaseUrl = () => {
    return `/${context.team.slug}`;
  };

  if (!PermissionsUtil.canViewAccess(context.permissions)) {
    return <Denied viewName='Access' />;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }
  const { containerAction, assetType, containerId } = params;
  const activeAsset = !assetType || assetType === 'access';
  const selectedId = parseInt(containerId, 10);
  const detailAccess = accesses.find(a => a.id === selectedId);
  const shouldRenderDetails = containerAction === 'details';

  return (
    <div className='card access-color'>
      <div className='card-header-access'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-address-card fa-xs' /> Access
          </h2>
          <Button color='link' onClick={openCreateModal}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add Access
          </Button>
        </div>
      </div>
      <div className='card-content'>
        {!shouldRenderDetails && renderTable()}
        {shouldRenderDetails && renderDetails(selectedId, detailAccess)}
        {activeAsset &&
          (containerAction === 'assign' || containerAction === 'create') &&
          renderAssignModal(selectedId, detailAccess)}
        {activeAsset &&
          containerAction === 'delete' &&
          renderDeleteModal(selectedId, detailAccess)}
      </div>
    </div>
  );
};

export default AccessContainer;
