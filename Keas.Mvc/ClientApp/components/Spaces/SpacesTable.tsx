import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { ISpace, ISpaceInfo } from '../../models/Spaces';
import { ReactTableUtil } from '../../util/tableUtil';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  filtered: any[];
  spaces: ISpaceInfo[];
  showDetails: (space: ISpace) => void;
  updateFilters: (filters: any[]) => void;
}

// UI for workstation column filter
const SpaceWorkstationColumnFilter = ({
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
      <option value='assigned'>Assigned</option>
      <option value='unassigned'>Unassigned</option>
      <option value='any'>Any</option>
    </select>
  );
};

// Logic to control what rows get displayed
const workstationFilter = (rows: any[], id, filterValue) => {
  if (filterValue === 'all') {
    return rows;
  }
  if (filterValue === 'unassigned') {
    return rows.filter(
      r =>
        getRowWorkstationsTotal(r) > 0 &&
        getRowWorkstationsInUse(r) < getRowWorkstationsTotal(r)
    );
  }
  if (filterValue === 'assigned') {
    return rows.filter(r => getRowWorkstationsInUse(r) > 0);
  }
  if (filterValue === 'any') {
    return rows.filter(r => getRowWorkstationsTotal(r) > 0);
  }
  return rows;
};

const getRowWorkstationsInUse = (row: any) => row.original?.workstationsInUse;
const getRowWorkstationsTotal = (row: any) => row.original?.workstationsTotal;

export default class SpacesTable extends React.Component<IProps, {}> {
  public render() {
    const columns: Column<ISpaceInfo>[] = [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original.space)}
          >
            Details
          </Button>
        ),
        Header: 'Details',
        maxWidth: 150
      },
      {
        Cell: data => (
          <span>
            {data.row.original.space.roomNumber}{' '}
            {data.row.original.space.bldgName}
          </span>
        ),
        Header: 'Room',
        accessor: row => row.space.roomNumber + ' ' + row.space.bldgName,
        id: 'room'
      },
      {
        Cell: data => <span>{data.row.original.space.roomName}</span>,
        Header: 'Room Name',
        accessor: key => key.space?.roomName
      },
      {
        Cell: data => <span>{data.row.original.keyCount}</span>,
        Header: 'Keys',
        accessor: 'keyCount'
      },
      {
        Cell: data => <span>{data.row.original.equipmentCount}</span>,
        Header: 'Equipment',
        accessor: 'equipmentCount'
      },
      {
        Cell: row => (
          <span>
            {row.value.workstationsInUse} / {row.value.workstationsTotal}
          </span>
        ),
        Filter: SpaceWorkstationColumnFilter,
        filter: 'workstation',
        Header: header => (
          <div>
            Workstations{' '}
            <i id='workstationsTooltip' className='fas fa-info-circle' />
            <UncontrolledTooltip placement='right' target='workstationsTooltip'>
              In Use / Total
            </UncontrolledTooltip>
          </div>
        ),
        accessor: spaceInfo => {
          return {
            workstationsInUse: spaceInfo.workstationsInUse,
            workstationsTotal: spaceInfo.workstationsTotal
          };
        },
        id: 'workstationsCount'
      }
    ];

    const initialState: Partial<TableState<any>> = {
      sortBy: [{ id: 'name' }],
      pageSize: ReactTableUtil.getPageSize()
    };

    return (
      <ReactTable
        data={this.props.spaces}
        columns={columns}
        initialState={initialState}
        filterTypes={{ workstation: workstationFilter }}
      />
    );
  }
}
