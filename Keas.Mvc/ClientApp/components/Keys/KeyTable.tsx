import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column } from 'react-table';

interface IProps {
  showDetails?: (key: IKey) => void;
  onEdit?: (key: IKey) => void;
  onDelete?: (key: IKey) => void;
  keysInfo: IKeyInfo[];
  filters: any[];
  onFiltersChange: (filters: any[]) => void;
}

interface IFilter {
  id: string;
  value: any;
}

interface IRow {
  original: IKeyInfo;
}

export default class KeyTable extends React.Component<IProps, {}> {
  public render() {
    const { filters, keysInfo } = this.props;
    // const columns: Column<IKeyInfo>[] = [
    const columns = [
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
        accessor: 'key.name'
        // accessor: row => row.key.name
      },
      {
        Header: 'Key Code',
        accessor: 'key.code'
        // accessor: row => row.key.code,
      },
      {
        Cell: row => (
          <span>
            {row.value.serialsInUse} / {row.value.serialsTotal}
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
            <option value='has-serial'>Has Serial</option>
            <option value='no-serial'>No Serial</option>
          </select>
        ),
        Header: header => (
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
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true;
          }
          if (filter.value === 'unassigned') {
            return (
              row.serialsCount.serialsTotal -
                row.serialsCount.serialsInUse >
              0
            );
          }
          if (filter.value === 'assigned') {
            return row.serialsCount.serialsInUse > 0;
          }
          if (filter.value === 'has-serial') {
            return row.serialsCount.serialsTotal > 0;
          }
          if (filter.value === 'no-serial') {
            return row.serialsCount.serialsTotal === 0;
          }
        },
        id: 'serialsCount',
        sortMethod: (a, b) => {
          if (a.serialsTotal === b.serialsTotal) {
            if (a.serialsInUse === b.serialsInUse) {
              return 0;
            } else {
              return a.serialsInUse < b.serialsInUse ? 1 : -1;
            }
          } else {
            return a.serialsTotal < b.serialsTotal ? 1 : -1;
          }
        }
      },
      {
        Cell: data => <span>{data.row.original.spacesCount}</span>,
        Header: 'Spaces',
        accessor: 'spacesCount',
      },
      {
        Cell: this.renderDropdownColumn,
        Header: 'Actions',
      }
    ];

    return (
      <ReactTable
        data={keysInfo}
        filterable={true}
        defaultPageSize={ReactTableUtil.getPageSize()}
        onPageSizeChange={pageSize => {
          ReactTableUtil.setPageSize(pageSize);
        }}
        minRows={1}
        filtered={filters}
        onFilteredChange={this.props.onFiltersChange}
        columns={columns}
        defaultSorted={[
          {
            desc: false,
            id: 'key.name'
          }
        ]}
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
