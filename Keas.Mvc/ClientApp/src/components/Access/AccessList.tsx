import * as React from 'react';
import { IAccess } from '../../models/Access';
import AccessListItem from './AccessListItem';

interface IProps {
  access: IAccess[];
  personView: boolean;
  onDelete?: (access: IAccess) => void;
  onAdd?: (access: IAccess) => void;
  onRevoke?: (assignment: IAccess) => void;
  showDetails: (access: IAccess) => void;
}

const AccessList = (props: IProps) => {
  const access =
    !props.access || props.access.length < 1 ? (
      <tr>
        <td colSpan={5}>No Accesses Found</td>
      </tr>
    ) : (
      props.access.map(x => (
        <AccessListItem
          key={x.id.toString()}
          accessEntity={x}
          personView={props.personView}
          onDelete={props.onDelete}
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

export default AccessList;
