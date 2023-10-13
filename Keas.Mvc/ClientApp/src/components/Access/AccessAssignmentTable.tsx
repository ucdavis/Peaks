import * as React from 'react';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import { ReactTable } from '../Shared/ReactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import { Column, TableState } from 'react-table';
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
        Cell: data => (
          <Button
            color='link'
            onClick={() => props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        Header: ' ',
        maxWidth: 150
      },
      {
        Header: 'Assignment',
        accessor: (accessAssignment: IAccessAssignment) =>
          !!accessAssignment
            ? `${accessAssignment.person.lastName}, ${accessAssignment.person.firstName}`
            : ``,
        id: 'assignedTo'
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ReactTableExpirationUtil.FilterHeader,
        filter: 'expiration',
        Header: 'Expiration',
        accessor: row => row.expiresAt,
        id: 'expiresAt'
      },
      {
        Cell: renderDropdownColumn,
        Header: 'Actions'
      }
    ],
    []
  );

  const accessAssignmentData = React.useMemo(() => accessAssignments, [
    accessAssignments
  ]);

  const initialState: Partial<TableState<any>> = {
    sortBy: [{ id: 'assignedTo' }, { id: 'expiresAt' }],
    pageSize: ReactTableUtil.getPageSize()
  };

  return (
    <ReactTable
      data={accessAssignmentData}
      columns={columns}
      initialState={initialState}
      filterTypes={{ expiration: ReactTableExpirationUtil.filterFunction }}
    />
  );
};

export default AccessAssignmentTable;
