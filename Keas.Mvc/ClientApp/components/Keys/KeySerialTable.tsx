import * as React from 'react';
import { Button } from 'reactstrap';
import { IKeySerial } from '../../models/KeySerials';
import { DateUtil } from '../../util/dates';
import {
  ExpirationColumnFilter,
  expirationFilter
} from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  keySerials: IKeySerial[];
  onAssign?: (keySerial: IKeySerial) => void;
  onRevoke?: (keySerial: IKeySerial) => void;
  onUpdate?: (keySerial: IKeySerial) => void;
  showDetails?: (keySerial: IKeySerial) => void;
  onEdit?: (keySerial: IKeySerial) => void;
}

interface IFilterOption {
  value: string;
  displayText: string;
}

// UI for Key status column filter
const KeyStatusColumnFilter = ({
  column: { filterValue, setFilter }
}) => {
  // Render a multi-select box
  return (
    <select
      value={filterValue}
      style={{ width: '100%' }}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
    >
      {ReactTableStatusUtil.defaultFilterOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.displayText}
        </option>
      ))}
    </select>
  );
};

// Logic to control what rows get displayed
const statusFilter = (rows: any[], id, filterValue) => {
  if (filterValue === 'all') {
    return rows;
  }
  if (filterValue === 'active') {
    return rows.filter(r => getRowStatus(r) === 'Active');
  }
  if (filterValue === 'inactive') {
    return rows.filter(
      r => getRowStatus(r) === 'Lost' || getRowStatus(r) === 'Destroyed'
    );
  }
  if (filterValue === 'special') {
    return rows.filter(r => getRowStatus(r) === 'Special');
  }
  return rows;
};

const getRowStatus = (row: any) => row.original?.status;

class ReactTableStatusUtil {
  // Lists filter options
  public static defaultFilterOptions: IFilterOption[] = [
    {
      displayText: 'Show All',
      value: 'all'
    },
    {
      displayText: 'Active',
      value: 'active'
    },
    {
      displayText: 'Inactive',
      value: 'inactive'
    },
    {
      displayText: 'Special',
      value: 'special'
    }
  ];

  public static filter = ReactTableStatusUtil.getFilter(
    ReactTableStatusUtil.defaultFilterOptions
  );

  public static filterMethod(filter, row) {
    if (filter.value === 'all') {
      return true;
    }
    if (filter.value === 'active') {
      return row.status === 'Active';
    }
    if (filter.value === 'inactive') {
      return row.status === 'Inactive';
    }
    if (filter.value === 'special') {
      return row.status === 'Special';
    }
  }

  // Displays all the filter options
  public static getFilter(options: IFilterOption[]) {
    return (filter, onChange) => {
      return (
        <select
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%' }}
          value={filter ? filter.value : 'all'}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.displayText}
            </option>
          ))}
        </select>
      );
    };
  }
}

export default class KeySerialTable extends React.Component<IProps, {}> {
  public render() {
    const { keySerials } = this.props;
    const columns: Column<IKeySerial>[] = [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        Header: 'Key Serial',
        maxWidth: 150
      },
      {
        Header: 'Key Code and SN',
        accessor: (keySerial: IKeySerial) => {
          return keySerial.key.code + '-' + keySerial.number;
        },
        id: 'keyCodeSN'
      },
      {
        Filter: KeyStatusColumnFilter,
        filter: 'status',
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'Assignment',
        accessor: (keySerial: IKeySerial) =>
          keySerial.keySerialAssignment
            ? keySerial.keySerialAssignment.person.name
            : null,
        id: 'assignedTo'
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ExpirationColumnFilter,
        filter: 'expiration',
        Header: 'Expiration',
        accessor: row => row.keySerialAssignment?.expiresAt,
        id: 'expiresAt'
      },
      {
        Cell: this.renderDropdownColumn,
        Header: 'Actions'
      }
    ];

    const initialState: Partial<TableState<any>> = {
      sortBy: [{ id: 'name' }],
      pageSize: ReactTableUtil.getPageSize()
    };

    return (
      <ReactTable
        data={keySerials}
        columns={columns}
        initialState={initialState}
        filterTypes={{ expiration: expirationFilter, status: statusFilter }}
      />
    );
  }

  private renderDropdownColumn = data => {
    const keySerial = data.row.original;

    const actions: IAction[] = [];
    if (!!this.props.onAssign && !keySerial.keySerialAssignment) {
      actions.push({
        onClick: () => this.props.onAssign(keySerial),
        title: 'Assign'
      });
    }

    if (!!this.props.onRevoke && !!keySerial.keySerialAssignment) {
      actions.push({
        onClick: () => this.props.onRevoke(keySerial),
        title: 'Revoke'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };
}
