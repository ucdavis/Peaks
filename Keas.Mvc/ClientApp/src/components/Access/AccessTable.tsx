import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import {
  ReactTableExpirationUtil,
  ReactTableNumberOfAssignmentsUtil
} from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  accesses: IAccess[];
  onDelete?: (access: IAccess) => void;
  onAdd?: (access: IAccess) => void;
  showDetails?: (access: IAccess) => void;
  onEdit?: (access: IAccess) => void;
}

const AccessTable = (props: IProps) => {
  const renderDropdownColumn = data => {
    const accessEntity: IAccess = data.row.original;
    const actions: IAction[] = [];

    if (!!props.onAdd) {
      actions.push({
        onClick: () => props.onAdd(accessEntity),
        title: 'Assign'
      });
    }

    if (!!props.onDelete) {
      actions.push({
        onClick: () => props.onDelete(accessEntity),
        title: 'Delete'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };

  const columns: Column<IAccess>[] = React.useMemo(
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
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Number of Assignments',
        accessor: x => x.assignments.length,
        id: 'numAssignments',
        filter: 'numAssignments',
        Filter: ReactTableNumberOfAssignmentsUtil.FilterHeader
      },
      {
        Header: 'Assigned To',
        accessor: x =>
          x.assignments
            .map(a =>
              !!a.person ? `${a.person.lastName}, ${a.person.firstName}` : ``
            )
            .join('; '),
        id: 'assignedTo'
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ReactTableExpirationUtil.AccessFilterHeader,
        filter: 'expiration',
        Header: 'First Expiration',
        accessor: x =>
          DateUtil.getFirstExpiration(x.assignments.map(y => y.expiresAt)),
        sortType: (a, b) =>
          ReactTableExpirationUtil.sortMethod(
            a.values.expiresAt,
            b.values.expiresAt
          ),
        id: 'expiresAt'
      },
      {
        Cell: renderDropdownColumn,
        Header: 'Actions'
      }
    ],
    [props]
  );

  const accessData = React.useMemo(() => props.accesses, [props.accesses]);

  const initialState: Partial<TableState<any>> = {
    sortBy: [{ id: 'name' }],
    pageSize: ReactTableUtil.getPageSize()
  };

  return (
    <ReactTable
      data={accessData}
      columns={columns}
      initialState={initialState}
      filterTypes={{
        expiration: ReactTableExpirationUtil.filterFunction,
        numAssignments: ReactTableNumberOfAssignmentsUtil.filterFunction
      }}
    />
  );
};

export default AccessTable;
