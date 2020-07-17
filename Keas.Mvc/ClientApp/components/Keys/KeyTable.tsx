import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  showDetails?: (key: IKey) => void;
  onEdit?: (key: IKey) => void;
  onDelete?: (key: IKey) => void;
  keysInfo: IKeyInfo[];
  filters: any[];
  onFiltersChange: (filters: any[]) => void;
}

// UI for serial column filter
const SerialColumnFilter = ({
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
      <option value='all'>Show All</option>
      <option value='unassigned'>Unassigned</option>
      <option value='assigned'>Assigned</option>
      <option value='hasSerial'>Has Serial</option>
      <option value='noSerial'>No Serial</option>
    </select>
  );
};

// Logic to control what rows get displayed
const serialFilter = (rows: any[], id, filterValue) => {
  if (filterValue === 'all') {
    return rows;
  }
  if (filterValue === 'unassigned') {
    return rows.filter(
      r => getRowSerialsInUse(r) === 0 && getRowSerialsTotal(r) > 0
    );
  }
  if (filterValue === 'assigned') {
    return rows.filter(r => getRowSerialsInUse(r) > 0);
  }
  if (filterValue === 'hasSerial') {
    return rows.filter(r => getRowSerialsTotal(r) > 0);
  }
  if (filterValue === 'noSerial') {
    return rows.filter(r => getRowSerialsTotal(r) === 0);
  }
  return rows;
};

const getRowSerialsInUse = (row: any) => row.original?.serialsInUseCount;
const getRowSerialsTotal = (row: any) => row.original?.serialsTotalCount;

export default class KeyTable extends React.Component<IProps, {}> {
  public render() {
    const { keysInfo } = this.props;
    const columns: Column<IKeyInfo>[] = [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original.key)}
          >
            Details
          </Button>
        ),
        Header: 'Details',
        maxWidth: 150
      },
      {
        Header: 'Key Name',
        id: 'name',
        accessor: row => row.key.name
      },
      {
        Header: 'Key Code',
        accessor: row => row.key.code
      },
      {
        Cell: row => (
          <span>
            {row.value.serialsInUse} / {row.value.serialsTotal}
          </span>
        ),
        Filter: SerialColumnFilter,
        filter: 'serial',
        Header: _ => (
          <div>
            Serials <i id='serialTooltip' className='fas fa-info-circle' />
            <UncontrolledTooltip placement='right' target='serialTooltip'>
              In Use / Total
            </UncontrolledTooltip>
          </div>
        ),
        accessor: keyInfo => {
          return {
            serialsInUse: keyInfo.serialsInUseCount,
            serialsTotal: keyInfo.serialsTotalCount
          };
        },
        id: 'serialsCount'
      },
      {
        Cell: data => <span>{data.row.original.spacesCount}</span>,
        Header: 'Spaces',
        accessor: 'spacesCount'
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
        data={keysInfo}
        columns={columns}
        initialState={initialState}
        filterTypes={{ serial: serialFilter }}
      />
    );
  }

  private renderDropdownColumn = data => {
    const key = data.row.original.key;

    const actions: IAction[] = [];

    if (!!this.props.onDelete) {
      actions.push({
        onClick: () => this.props.onDelete(key),
        title: 'Delete'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };
}
