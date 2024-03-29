import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import AccessAssignmentList from './AccessList';
import AssignAccess from './AssignAccess';
import RevokeAccess from './RevokeAccess';
import UpdateAccessAssignment from './UpdateAccessAssignment';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import AccessAssignmentDetails from './AccessAssignmentDetails';
import AccessAssignmentTable from './AccessAssignmentTable';
import { Button } from 'reactstrap';

// List of assignments passed by props, since this container can be in multiple places
interface IProps {
  person?: IPerson;
  access?: IAccess;
  onRevokeSuccess?: (assignments: IAccessAssignment[]) => any;
  onAssignSuccess: (assignments: IAccessAssignment[]) => void;
  goToAccessDetails?: (access: IAccess) => void; // only supplied in person container
}

const AccessAssignmentContainer = (props: IProps) => {
  const context = useContext(Context);
  const params: IMatchParams = useParams();
  const history = useHistory();
  const accessWithoutAssignments = !!props.access && {
    ...props.access,
    assignments: []
  };
  const [accessAssignments, setAssignments] = useState<IAccessAssignment[]>(
    (props.access &&
      props.access.assignments.map(assignment => ({
        ...assignment,
        access: accessWithoutAssignments // we use assignment.access
      }))) ||
      []
  );
  const [selectedAssignment, setSelectedAssignment] = useState<
    IAccessAssignment
  >(accessAssignments.find(el => el.id === parseInt(params.id, 10)));
  const selectedAccess = !!props.access // if we are on /access/details, use the actual access so edits are reflected
    ? props.access
    : selectedAssignment?.access;

  useEffect(() => {
    if (!PermissionsUtil.canViewAccess(context.permissions)) {
      return;
    }

    const fetchAssignments = async (): Promise<void> => {
      if (!props.person) {
        // only want to fetch assignments if we are on a person page, otherwise they are passed in by props.access
        return;
      }
      const accessFetchUrl = `/api/${context.team.slug}/access/listAssigned?personId=${props.person.id}`;
      let updatedAccessAssignments: IAccessAssignment[] = null;
      try {
        updatedAccessAssignments = await context.fetch(accessFetchUrl);
      } catch (err) {
        toast.error('Error loading access list. Please refresh and try again.');
      }

      setAssignments(updatedAccessAssignments);
      setSelectedAssignment(
        updatedAccessAssignments.find(el => el.id === parseInt(params.id, 10))
      );
    };

    fetchAssignments();
  }, [context, params.id, props.person]);

  const getBaseUrl = () => {
    return props.person
      ? `/${context.team.slug}/people/details/${props.person.id}`
      : `/${context.team.slug}/access/details/${props.access.id}`;
  };

  const openRevokeModal = (assignment: IAccessAssignment) => {
    setSelectedAssignment(assignment);
    history.push(`${getBaseUrl()}/accessAssignment/revoke/${assignment.id}`);
  };

  const openUpdateModal = (assignment: IAccessAssignment) => {
    setSelectedAssignment(assignment);
    history.push(`${getBaseUrl()}/accessAssignment/update/${assignment.id}`);
  };

  const openDetailsModal = (assignment: IAccessAssignment) => {
    setSelectedAssignment(assignment);
    history.push(`${getBaseUrl()}/accessAssignment/details/${assignment.id}`);
  };

  const openAssignModal = () => {
    history.push(
      `${getBaseUrl()}/access/assign${
        props.access ? '/' + props.access.id : ''
      }`
    );
  };

  const closeModals = () => {
    setSelectedAssignment(null);
    history.push(`${getBaseUrl()}`);
  };

  const revokeAssignment = async assignment => {
    try {
      await context.fetch(
        `/api/${context.team.slug}/access/revoke/${assignment.id}`,
        {
          method: 'POST'
        }
      );
    } catch (err) {
      toast.error('Error revoking access for user');
      throw new Error(); // throw error so modal doesn't close
    }

    toast.success('Access revoked sucessfully!');

    const assignmentsData: IAccessAssignment[] = [...accessAssignments];
    assignmentsData.splice(accessAssignments.indexOf(assignment), 1);
    setAssignments(assignmentsData);

    if (props.onRevokeSuccess) {
      props.onRevokeSuccess(assignmentsData);
    }
  };

  const assignAccessAssignment = async (
    access: IAccess,
    date: any,
    person: IPerson
  ) => {
    if (access.id === 0) {
      // if we are creating a new access (on person details page)
      access.teamId = context.team.id;
      try {
        access = await context.fetch(
          `/api/${context.team.slug}/access/create`,
          {
            body: JSON.stringify(access),
            method: 'POST'
          }
        );
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

    const assignUrl = `/api/${context.team.slug}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;
    let accessAssignment: IAccessAssignment = null;
    try {
      accessAssignment = await context.fetch(assignUrl, {
        method: 'POST'
      });
      accessAssignment.person = person;
      toast.success('Access assigned successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error updating access'
          : `Error updating access, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    let updatedAssignments = [...accessAssignments];
    const index = updatedAssignments.findIndex(
      a => a.id === accessAssignment.id
    );
    if (index < 0) {
      // if we have created a new access, add to our state
      updatedAssignments.push(accessAssignment);
    } else {
      updatedAssignments[index] = accessAssignment;
    }
    setAssignments(updatedAssignments);
    props.onAssignSuccess(updatedAssignments);
  };

  if (!PermissionsUtil.canViewAccess(context.permissions)) {
    return <Denied viewName='Access' />;
  }
  const { action, assetType, id } = params;
  const isRevokeModalShown =
    assetType === 'accessAssignment' && action === 'revoke';
  const isUpdateModalShown =
    assetType === 'accessAssignment' && action === 'update';
  const isDetailsModalShown =
    assetType === 'accessAssignment' && action === 'details';
  const isAssignModalShown = assetType === 'access' && action === 'assign';

  const selectedId = parseInt(id, 10);

  return (
    <div>
      {isDetailsModalShown && (
        <AccessAssignmentDetails
          selectedAccessAssignment={selectedAssignment}
          selectedAccess={selectedAccess}
          isModalOpen={isDetailsModalShown}
          closeModal={closeModals}
          openUpdateModal={openUpdateModal}
          updateSelectedAccessAssignment={setSelectedAssignment}
          goToAccessDetails={props.goToAccessDetails}
        />
      )}
      {isRevokeModalShown && (
        <RevokeAccess
          key={`revoke-access-${selectedId}`}
          selectedAccessAssignment={selectedAssignment}
          revokeAccessAssignment={revokeAssignment}
          closeModal={closeModals}
          isModalOpen={isRevokeModalShown}
          openUpdateModal={openUpdateModal}
          selectedAccess={selectedAccess}
        />
      )}
      {isUpdateModalShown && (
        <UpdateAccessAssignment
          key={`update-accessAssignment-${selectedId}`}
          accessAssignment={selectedAssignment}
          onUpdate={assignAccessAssignment}
          closeModal={closeModals}
          isModalOpen={isUpdateModalShown}
          selectedAccess={selectedAccess}
        />
      )}
      {isAssignModalShown && (
        <AssignAccess
          key={`assign-access-${selectedId}`}
          closeModal={closeModals}
          modal={isAssignModalShown}
          person={props.person}
          tags={context.tags}
          selectedAccess={selectedAccess}
          onCreate={assignAccessAssignment}
        />
      )}
      <div className='card access-color'>
        <div className='card-header-access'>
          <div className='card-head row justify-content-between'>
            <h2>
              <i className='fas fa-address-card fa-xs' /> Assignments
            </h2>
            <Button color='link' onClick={openAssignModal}>
              <i className='fas fa-plus fa-sm' aria-hidden='true' /> Assign
              Access
            </Button>
          </div>
        </div>
        <div className='card-content'>
          {props.person ? (
            <AccessAssignmentList
              showDetails={openDetailsModal}
              personView={true}
              personId={props.person.id}
              accessAssignments={accessAssignments}
              onRevoke={openRevokeModal}
            />
          ) : (
            <AccessAssignmentTable
              accessAssignments={accessAssignments}
              showDetails={openDetailsModal}
              onRevoke={openRevokeModal}
              onUpdate={openUpdateModal}
            />
          )}{' '}
        </div>
      </div>
    </div>
  );
};

export default AccessAssignmentContainer;
