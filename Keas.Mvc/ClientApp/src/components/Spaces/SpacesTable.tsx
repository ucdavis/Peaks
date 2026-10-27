import { AssetDetailsLink } from '../Shared/AssetDetailsLink';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { ISpace, ISpaceInfo } from '../../models/Spaces';
import { ReactTableUtil } from '../../util/tableUtil';
import { ReactTable } from '../Shared/ReactTable';
import {
  PeaksColumn as Column,
  PeaksInitialState
} from '../Shared/tableFeatures';

interface IProps {
  filtered: any[];
  spaces: ISpaceInfo[];
  showDetails: (space: ISpace) => void;
  updateFilters: (filters: any[]) => void;
}

// UI for workstation column filter
const SpaceWorkstationColumnFilter = ({ column }) => {
  const filterValue = column.getFilterValue();
  const setFilter = value => column.setFilterValue(value);
  return (
    <select
      className='select select-sm w-full'
      value={filterValue}
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
const workstationFilter = (row: any, id, filterValue) => {
  if (filterValue === 'all') {
    return true;
  }
  if (filterValue === 'unassigned') {
    return (
      getRowWorkstationsTotal(row) > 0 &&
      getRowWorkstationsInUse(row) < getRowWorkstationsTotal(row)
    );
  }
  if (filterValue === 'assigned') {
    return getRowWorkstationsInUse(row) > 0;
  }
  if (filterValue === 'any') {
    return getRowWorkstationsTotal(row) > 0;
  }
  return true;
};

const getRowWorkstationsInUse = (row: any) => row.original?.workstationsInUse;
const getRowWorkstationsTotal = (row: any) => row.original?.workstationsTotal;

const SpacesTable = (props: IProps) => {
  const columns: Column<ISpaceInfo>[] = React.useMemo(
    () => [
      {
        cell: data => (
          <AssetDetailsLink
            path={`spaces/details/${data.row.original.space.id}`}
            onClick={() => props.showDetails(data.row.original.space)}
          />
        ),
        header: ' '
      },
      {
        cell: data => (
          <span>
            {data.row.original.space.roomNumber}{' '}
            {data.row.original.space.bldgName}{' '}
            {!data.row.original.space.active && (
              <span className='text-error'> (Inactive)</span>
            )}
          </span>
        ),
        header: 'Room',
        accessorFn: row => row.space.roomNumber + ' ' + row.space.bldgName,
        id: 'room'
      },
      {
        cell: data => <span>{data.row.original.space.roomName}</span>,
        header: 'Room Name',
        accessorFn: key => key.space?.roomName
      },
      {
        cell: data => <span>{data.row.original.keyCount}</span>,
        header: 'Keys',
        accessorKey: 'keyCount',
        enableColumnFilter: false
      },
      {
        cell: data => <span>{data.row.original.equipmentCount}</span>,
        header: 'Equipment',
        accessorKey: 'equipmentCount',
        enableColumnFilter: false
      },
      {
        cell: row => (
          <span>
            {row.getValue().workstationsInUse} /{' '}
            {row.getValue().workstationsTotal}
          </span>
        ),
        meta: { Filter: SpaceWorkstationColumnFilter },
        filterFn: workstationFilter,
        header: header => (
          <div>
            Workstations{' '}
            <InformationCircleIcon
              data-icon='information-circle'
              id='workstationsTooltip'
              className='hero-icon size-5'
            />
            <UncontrolledTooltip placement='right' target='workstationsTooltip'>
              In Use / Total
            </UncontrolledTooltip>
          </div>
        ),
        accessorFn: spaceInfo => {
          return {
            workstationsInUse: spaceInfo.workstationsInUse,
            workstationsTotal: spaceInfo.workstationsTotal
          };
        },
        id: 'workstationsCount',
        enableSorting: false
      }
    ],
    []
  );

  const spacesData = React.useMemo(() => props.spaces, [props.spaces]);

  const initialState: PeaksInitialState = {
    sorting: [{ id: 'room', desc: false }],
    pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
  };

  return (
    <ReactTable
      data={spacesData}
      columns={columns}
      initialState={initialState}
    />
  );
};

export default SpacesTable;
