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
import { PeaksColumn as Column, PeaksInitialState } from '../Shared/tableFeatures';

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
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Number of Assignments',
        accessorFn: x => x.assignments.length,
        id: 'numAssignments',
        filterFn: ReactTableNumberOfAssignmentsUtil.filterFunction,
        meta: { Filter: ReactTableNumberOfAssignmentsUtil.FilterHeader }
      },
      {
        header: 'Assigned To',
        accessorFn: x =>
          x.assignments
            .map(a =>
              !!a.person ? `${a.person.lastName}, ${a.person.firstName}` : ``
            )
            .join('; '),
        id: 'assignedTo'
      },
      {
        cell: row => (
          <span>{row.getValue() ? DateUtil.formatExpiration(row.getValue()) : ''}</span>
        ),
        meta: { Filter: ReactTableExpirationUtil.AccessFilterHeader },
        filterFn: ReactTableExpirationUtil.filterFunction,
        header: 'First Expiration',
        accessorFn: x =>
          DateUtil.getFirstExpiration(x.assignments.map(y => y.expiresAt)),
        sortFn: (a, b) =>
          ReactTableExpirationUtil.sortMethod(
            a.getValue('expiresAt'),
            b.getValue('expiresAt')
          ),
        id: 'expiresAt'
      },
      {
        cell: renderDropdownColumn,
        header: 'Actions'
      }
    ],
    [props]
  );

  const accessData = React.useMemo(() => props.accesses, [props.accesses]);

  const initialState: PeaksInitialState = {
    sorting: [{ id: 'name', desc: false }],
    pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
  };

  return (
    <ReactTable
      data={accessData}
      columns={columns}
      initialState={initialState}
    />
  );
};

export default AccessTable;
