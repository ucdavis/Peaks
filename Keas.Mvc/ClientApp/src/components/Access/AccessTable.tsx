import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import {
  ExpirationColumnFilter,
  expirationFilter,
  IFilterOption,
  ReactTableExpirationUtil
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

  const filterOptions: IFilterOption[] = [
    {
      displayText: 'Show All',
      value: 'all'
    }, // no "unassigned" option
    {
      displayText: 'Expired',
      value: 'expired'
    },
    {
      displayText: 'All Unexpired',
      value: 'unexpired'
    },
    {
      displayText: 'Expiring within 3 weeks',
      value: '3weeks'
    },
    {
      displayText: 'Expiring within 6 weeks',
      value: '6weeks'
    }
  ];

  // UI for expiration column filter
  const AccessExpirationColumnFilter = ({
    column: { filterValue, setFilter }
  }) => {
    // Render a multi-select box
    return (
      <select
        className='form-control'
        value={filterValue}
        style={{ width: '100%' }}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
      >
        {filterOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.displayText}
          </option>
        ))}
      </select>
    );
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
        id: 'numAssignments'
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
        Filter: AccessExpirationColumnFilter,
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
      filterTypes={{ expiration: expirationFilter }}
    />
  );
};

export default AccessTable;
