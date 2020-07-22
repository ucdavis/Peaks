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

// UI for Key status column filter
const KeyStatusColumnFilter = ({ column: { filterValue, setFilter } }) => {
  // Render a multi-select box
  return (
    <select
      value={filterValue}
      style={{ width: '100%' }}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value='all'>Show All</option>
      <option value='active'>Active</option>
      <option value='inactive'>Inactive</option>
      <option value='special'>Special</option>
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
        Header: ' ',
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
