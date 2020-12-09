import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import AccessAssignmentCard from './AccessAssignmentCard';
import AssignmentTable from './AccessAssignmentTable';
import AccessList from './AccessList';
import AssignAccess from './AssignAccess';
import RevokeAccess from './RevokeAccess';
import UpdateAccess from './UpdateAccess';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';

// List of assignments passed by props, since this container can be in multiple places
interface IProps {
  person?: IPerson;
  access?: IAccess;
  onRevokeSuccess?(assignment: IAccessAssignment);
  onAssignSuccess?(access: IAccessAssignment);
}

const AssignmentContainer = (props: IProps) => {
  const context = useContext(Context);
  const params: IMatchParams = useParams();
  const history = useHistory();
  const [assignments, setAssignments] = useState<IAccessAssignment[]>(
    (props.access &&
      props.access.assignments.map(assignment => ({
        ...assignment,
        access: props.access
      }))) ||
      []
  );
  const [selectedAssignment, setSelectedAssignment] = useState<
    IAccessAssignment
  >(assignments.find(el => el.id === parseInt(params.id, 10)));

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

  const showRevokeModal = (assignment: IAccessAssignment) => {
    setSelectedAssignment(assignment);
    history.push(`${getBaseUrl()}/accessAssignment/revoke/${assignment.id}`);
  };

  const showEditModal = (assignment: IAccessAssignment) => {
    setSelectedAssignment(assignment);
    history.push(`${getBaseUrl()}/accessAssignment/update/${assignment.id}`);
  };

  const hideModals = () => {
    setSelectedAssignment(null);
    history.replace(getBaseUrl());
  };

  const callRevoke = async assignment => {
    await context.fetch(
      `/api/${context.team.slug}/access/revoke/${assignment.id}`,
      {
        method: 'POST'
      }
    );

    toast.success('Access revoked sucessfully!');

    const assignmentsData = assignments;
    assignmentsData.splice(assignments.indexOf(assignment), 1);
    setAssignments(assignmentsData);
    hideModals();

    if (props.onRevokeSuccess) {
      props.onRevokeSuccess(assignment);
    }
  };

  const callUpdate = async (access: IAccess, date: any, person: IPerson) => {
    const assignUrl = `/api/${context.team.slug}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;
    let accessAssignment: IAccessAssignment = null;
    try {
      accessAssignment = await context.fetch(assignUrl, {
        method: 'POST'
      });

      accessAssignment.access = {
        ...access,
        assignments: [...access.assignments, accessAssignment]
      };
      toast.success('Access updated successfully!');
    } catch (err) {
      toast.error('Error assigning access.');
      throw new Error(); // throw error so modal doesn't close
    }

    const assignmentsData = assignments;
    setAssignments(assignmentsData);
    hideModals();
  };

  const openAssignModal = () => {
    history.push(
      `${getBaseUrl()}/access/assign${
        props.access ? '/' + props.access.id : ''
      }`
    );
  };

  const callAssign = async (access: IAccess, date: any, person: IPerson) => {
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
        toast.error('Error creating access.');
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
      toast.error('Error assigning access.');
      throw new Error(); // throw error so modal doesn't close
    }

    const assignmentsData = assignments;
    assignments.push(accessAssignment);
    setAssignments(assignmentsData);
    props.onAssignSuccess(accessAssignment);
  };

  const openDetails = (access: IAccess) => {
    history.push(`/${context.team.slug}/access/details/${access.id}`);
  };

  const getBaseUrl = () => {
    return props.person
      ? `/${context.team.slug}/people/details/${props.person.id}`
      : `/${context.team.slug}/access/details/${props.access.id}`;
  };

  if (!PermissionsUtil.canViewAccess(context.permissions)) {
    return <Denied viewName='Access' />;
  }
  const { action, assetType } = params;
  const isRevokeModalShown =
    assetType === 'accessAssignment' && action === 'revoke';
  const isEditModalShown =
    assetType === 'accessAssignment' && action === 'update';
  const isAssignModalShown = assetType === 'access' && action === 'assign';

  return (
    <div>
      {isRevokeModalShown && (
        <RevokeAccess
          assignment={selectedAssignment}
          revoke={callRevoke}
          cancelRevoke={hideModals}
        />
      )}
      {isEditModalShown && (
        <UpdateAccess
          assignment={selectedAssignment}
          update={callUpdate}
          cancelUpdate={hideModals}
        />
      )}
      {isAssignModalShown && (
        <AssignAccess
          closeModal={hideModals}
          modal={isAssignModalShown}
          person={props.person}
          tags={context.tags}
          selectedAccess={props.access}
          onCreate={callAssign}
        />
      )}
      <AccessAssignmentCard openAssignModal={openAssignModal}>
        {props.person ? (
          <AccessList
            showDetails={openDetails}
            personView={true}
            access={assignments.map(assignment => assignment.access)}
            onRevoke={access =>
              showRevokeModal(
                assignments.find(
                  assignment =>
                    assignment.accessId === access.id &&
                    assignment.personId === props.person.id
                )
              )
            }
          />
        ) : (
          <AssignmentTable
            assignments={assignments}
            onRevoke={showRevokeModal}
            onEdit={showEditModal}
          />
        )}
      </AccessAssignmentCard>
    </div>
  );
};

export default AssignmentContainer;
