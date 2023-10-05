import * as React from 'react';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessAssignmentListItem from './AccessListItem';

interface IProps {
  accessAssignments: IAccessAssignment[];
  personView: boolean; // is always true but i'm leaving /shrug -river
  personId: number; // for showing the right expiration date
  onAdd?: (access: IAccess) => void;
  onRevoke?: (accessAssignment: IAccessAssignment) => void;
  showDetails: (accessAssignment: IAccessAssignment) => void;
}

// this is only accessed on person details
const AccessAssignmentList = (props: IProps) => {
  const access =
    !props.accessAssignments || props.accessAssignments.length < 1 ? (
      <tr>
        <td colSpan={5}>No Accesses Found</td>
      </tr>
    ) : (
      props.accessAssignments.map(x => (
        <AccessAssignmentListItem
          key={x.id.toString()}
          assignment={x}
          personView={props.personView}
          personId={props.personId}
          onAdd={props.onAdd}
          onRevoke={props.onRevoke}
          showDetails={props.showDetails}
        />
      ))
    );
  return (
    <table className='table'>
      <thead>
        <tr>
          <th />
          <th>Name</th>
          <th>Assigned?</th>
          <th>Number of Assignments</th>
          <th>Expiration</th>
          <th className='list-actions'>Actions</th>
        </tr>
      </thead>
      <tbody>{access}</tbody>
    </table>
  );
};

export default AccessAssignmentList;
