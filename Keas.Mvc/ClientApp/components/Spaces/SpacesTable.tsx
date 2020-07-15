import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { ISpace, ISpaceInfo } from '../../models/Spaces';
import { ReactTableUtil } from '../../util/tableUtil';
import { ReactTable } from '../Shared/ReactTable';
import { Column } from 'react-table';

interface IProps {
  filtered: any[];
  spaces: ISpaceInfo[];
  showDetails: (space: ISpace) => void;
  updateFilters: (filters: any[]) => void;
}

export default class SpacesTable extends React.Component<IProps, {}> {
  public render() {
    // const columns: Column<ISpaceInfo>[] = [
    const columns = [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original.space)}
          >
            Details
          </Button>
        ),
        Header: 'Actions',
        maxWidth: 150,
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
        // accessor: 'space.roomName',
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
        Filter: ({ filter, onChange }) => (
          <select
            onChange={e => onChange(e.target.value)}
            style={{ width: '100%' }}
            value={filter ? filter.value : 'all'}
          >
            <option value='all'>Show All</option>
            <option value='unassigned'>Unassigned</option>
            <option value='assigned'>Assigned</option>
            <option value='any'>Any</option>
          </select>
        ),
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
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true;
          }
          if (filter.value === 'unassigned') {
            return (
              row.workstationsCount.workstationsTotal -
                row.workstationsCount.workstationsInUse >
              0
            );
          }
          if (filter.value === 'assigned') {
            return row.workstationsCount.workstationsInUse > 0;
          }
          if (filter.value === 'any') {
            return row.workstationsCount.workstationsTotal > 0;
          }
        },
        id: 'workstationsCount',
        sortMethod: (a, b) => {
          if (a.workstationsTotal === b.workstationsTotal) {
            if (a.workstationsInUse === b.workstationsInUse) {
              return 0;
            } else {
              return a.workstationsInUse < b.workstationsInUse ? 1 : -1;
            }
          } else {
            return a.workstationsTotal < b.workstationsTotal ? 1 : -1;
          }
        }
      }
    ];

    return (
      <ReactTable
        data={this.props.spaces}
        filterable={true}
        minRows={1}
        filtered={this.props.filtered}
        onFilteredChange={filtered => this.props.updateFilters(filtered)}
        defaultPageSize={ReactTableUtil.getPageSize()}
        onPageSizeChange={pageSize => {
          ReactTableUtil.setPageSize(pageSize);
        }}
        columns={columns}
        defaultSorted={[
          {
            desc: false,
            id: 'room'
          }
        ]}
      />
    );
  }
}
