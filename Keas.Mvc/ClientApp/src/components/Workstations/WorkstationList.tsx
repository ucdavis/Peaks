import * as React from 'react';
import { IWorkstation } from '../../models/Workstations';
import WorkstationListItem from './WorkstationListItem';

interface IProps {
  workstations: IWorkstation[];
  onRevoke?: (workstation: IWorkstation) => void;
  onAdd?: (workstation: IWorkstation) => void;
  onCreate?: () => void;
  showDetails?: (workstation: IWorkstation) => void;
  onEdit?: (workstation: IWorkstation) => void;
  onDelete?: (workstation: IWorkstation) => void;
}

const WorkstationList = (props: IProps) => {
  const workstations =
    !props.workstations || props.workstations.length < 1 ? (
      <tr>
        <td colSpan={5}>No Workstations Found</td>
      </tr>
    ) : (
      props.workstations.map(x => (
        <WorkstationListItem
          key={x.id.toString()}
          workstationEntity={x}
          onRevoke={props.onRevoke}
          onAdd={props.onAdd}
          showDetails={props.showDetails}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
        />
      ))
    );

  return (
    <div className='table'>
      <table className='table'>
        <thead>
          <tr>
            <th />
            <th>Name</th>
            <th>Space</th>
            <th>Assigned To</th>
            <th>Expiration</th>
            <th className='list-actions'>Actions</th>
          </tr>
        </thead>
        <tbody>{workstations}</tbody>
      </table>
    </div>
  );
};

export default WorkstationList;
