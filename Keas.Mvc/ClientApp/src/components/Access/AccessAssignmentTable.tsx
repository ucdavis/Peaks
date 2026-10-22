import * as React from 'react';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import { ReactTable } from '../Shared/ReactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import {
  PeaksColumn as Column,
  PeaksInitialState
} from '../Shared/tableFeatures';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { Button } from 'reactstrap';
import { ReactTableExpirationUtil } from '../../util/reactTable';

interface IProps {
  accessAssignments: IAccessAssignment[];
  onRevoke?: (assignment: IAccessAssignment) => void;
  onUpdate?: (assignment: IAccessAssignment) => void;
  showDetails?: (assignment: IAccessAssignment) => void;
  disableEditing?: boolean;
}

const AccessAssignmentTable = (props: IProps) => {
  const renderDropdownColumn = data => {
    const accessAssignment = data.row.original;

    const actions: IAction[] = [];

    if (!!props.onRevoke && !!accessAssignment) {
      actions.push({
        onClick: () => props.onRevoke(accessAssignment),
        title: 'Revoke'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };

  const { accessAssignments } = props;
  const columns: Column<IAccessAssignment>[] = React.useMemo(
    () => [
      {
        cell: data => (
          <Button
            color='link'
            onClick={() => props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        header: ' '
      },
      {
        header: 'Assignment',
        accessorFn: (accessAssignment: IAccessAssignment) =>
          accessAssignment
            ? `${accessAssignment.person.lastName}, ${accessAssignment.person.firstName}`
            : ``,
        id: 'assignedTo'
      },
      {
        cell: row => (
          <span>
            {row.getValue() ? DateUtil.formatExpiration(row.getValue()) : ''}
          </span>
        ),
        meta: { Filter: ReactTableExpirationUtil.AccessFilterHeader },
        filterFn: ReactTableExpirationUtil.filterFunction,
        header: 'Expiration',
        accessorFn: row => row.expiresAt,
        id: 'expiresAt'
      },
      {
        cell: renderDropdownColumn,
        header: 'Actions'
      }
    ],
    []
  );

  const accessAssignmentData = React.useMemo(() => accessAssignments, [
    accessAssignments
  ]);

  const initialState: PeaksInitialState = {
    sorting: [
      { id: 'assignedTo', desc: false },
      { id: 'expiresAt', desc: false }
    ],
    pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
  };

  return (
    <ReactTable
      data={accessAssignmentData}
      columns={columns}
      initialState={initialState}
    />
  );
};

export default AccessAssignmentTable;
