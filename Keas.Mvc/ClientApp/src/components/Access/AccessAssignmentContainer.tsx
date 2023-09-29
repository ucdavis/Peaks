import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import AccessList from './AccessList';
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
  onRevokeSuccess?: (assignment: IAccessAssignment) => any;
  onAssignSuccess: () => void;
  openEditModal?: (access: IAccess) => void;
  goToAccessDetails?: (access: IAccess) => void; // only supplied in person container
}

const AccessAssignmentContainer = (props: IProps) => {
  const context = useContext(Context);
  const params: IMatchParams = useParams();
  const history = useHistory();
  const [accessAssignments, setAssignments] = useState<IAccessAssignment[]>(
    (props.access &&
      props.access.assignments.map(assignment => ({
        ...assignment,
        access: props.access
      }))) ||
      []
  );
  const [selectedAssignment, setSelectedAssignment] = useState<
    IAccessAssignment
  >(accessAssignments.find(el => el.id === parseInt(params.id, 10)));

  useEffect(() => {
    if (!PermissionsUtil.canViewAccess(context.permissions)) {
      return;
    }

    // assume that props.person is valid
    const fetchAssignments = async (): Promise<IAccessAssignment[]> => {
      const accessFetchUrl = `/api/${context.team.slug}/access/listAssigned?personId=${props.person.id}`;
      let accesses: IAccess[] = null;
      try {
        accesses = await context.fetch(accessFetchUrl);
      } catch (err) {
        toast.error('Error loading access list. Please refresh and try again.');
      }

      return accesses.map(access => ({
        ...access.assignments.find(
          assignment =>
            assignment.accessId === access.id &&
            assignment.personId === props.person.id
        ),
        access
      }));
    };

    const getAssignments = async () => {
      if (props.person) {
        const assignmentsData = await fetchAssignments();
        setAssignments(assignmentsData);
        setSelectedAssignment(
          assignmentsData.find(el => el.id === parseInt(params.id, 10))
        );
      }
    };

    getAssignments();
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

    const assignmentsData = accessAssignments;
    assignmentsData.splice(accessAssignments.indexOf(assignment), 1);
    setAssignments(assignmentsData);

    if (props.onRevokeSuccess) {
      props.onRevokeSuccess(assignment);
    }
  };

  const updateAssignment = async (
    access: IAccess,
    date: any,
    person: IPerson
  ) => {
    const assignUrl = `/api/${context.team.slug}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;
    let accessAssignment: IAccessAssignment = null;
    try {
      accessAssignment = await context.fetch(assignUrl, {
        method: 'POST'
      });
      accessAssignment.access = {
        // our backend doesn't return recursive data,
        ...access,
        assignments: [...access.assignments] // so we have to copy from our original object
      };
      const index = accessAssignment.access.assignments.findIndex(
        a => a.id === accessAssignment.id
      );
      if (index < 0)
        // should not happen since we are always updating an existing assignment
        // not sure what we do here lol
        throw Error('Error updating access assignment');
      else {
        // not sure it matters much to our state here, but the RequestedBy info could have changed
        // and just generally a good idea to have our state reflect the server's
        accessAssignment.access.assignments[index] = accessAssignment;
      }
      toast.success('Access updated successfully!');
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
      // should not happen since we are always updating an existing assignment
      toast.error(
        'congratulations, you found an error that should not happen! please report this to the dev team for a gold star'
      );
      throw new Error();
    }
    updatedAssignments[index] = accessAssignment;
    setAssignments(updatedAssignments);
  };

  const assignAssignment = async (
    access: IAccess,
    date: any,
    person: IPerson
  ) => {
    if (access.id === 0) {
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
      access.assignments.push(accessAssignment);
      toast.success('Access assigned successfully!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error assigning access'
          : `Error assigning access, ${err.message}`;
      toast.error(errorMessage);
      throw new Error(); // throw error so modal doesn't close
    }

    const assignmentsData = accessAssignments;
    accessAssignments.push(accessAssignment);
    setAssignments(assignmentsData);
    props.onAssignSuccess();
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
          isModalOpen={isDetailsModalShown}
          closeModal={closeModals}
          openEditModal={props.openEditModal}
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
          openEditModal={props.openEditModal}
        />
      )}
      {isUpdateModalShown && (
        <UpdateAccessAssignment
          key={`update-accessAssignment-${selectedId}`}
          accessAssignment={selectedAssignment}
          onUpdate={updateAssignment}
          closeModal={closeModals}
          isModalOpen={isUpdateModalShown}
        />
      )}
      {isAssignModalShown && (
        <AssignAccess
          key={`assign-access-${selectedId}`}
          closeModal={closeModals}
          modal={isAssignModalShown}
          person={props.person}
          tags={context.tags}
          selectedAccess={props.access}
          onCreate={assignAssignment}
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
            <AccessList
              showDetails={access =>
                openDetailsModal(
                  accessAssignments.find(
                    assignment =>
                      assignment.accessId === access.id &&
                      assignment.personId === props.person.id
                  )
                )
              }
              personView={true}
              personId={props.person.id}
              access={accessAssignments.map(assignment => assignment.access)}
              onRevoke={access =>
                openRevokeModal(
                  accessAssignments.find(
                    assignment =>
                      assignment.accessId === access.id &&
                      assignment.personId === props.person.id
                  )
                )
              }
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
