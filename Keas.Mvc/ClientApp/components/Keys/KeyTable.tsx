import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';

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
        columns={[
          {
            Cell: (row: IRow) => (
              <Button
                color='link'
                onClick={() => this.props.showDetails(row.original.key)}
              >
                Details
              </Button>
            ),
            Header: '',
            className: 'key-details',
            filterable: false,
            headerClassName: 'key-details',
            maxWidth: 150,
            resizable: false,
            sortable: false
          },
          {
            Header: 'Key Name',
            accessor: 'key.name',
            className: 'word-wrap',
            filterMethod: (filter: IFilter, row: IRow) =>
              !!row[filter.id] &&
              row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
          },
          {
            Header: 'Key Code',
            accessor: 'key.code',
            filterMethod: (filter: IFilter, row: IRow) =>
              !!row[filter.id] &&
              filter.value &&
              (row[filter.id]
                .toLowerCase()
                .includes(filter.value.toLowerCase()) ||
                filter.value
                  .toLowerCase()
                  .includes(row[filter.id].toLowerCase()))
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
            className: 'table-10p',
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
            headerClassName: 'table-10p',
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
            Cell: row => <span>{row.original.spacesCount}</span>,
            Header: 'Spaces',
            accessor: 'spacesCount',
            className: 'table-actions',
            filterable: false,
            headerClassName: 'table-actions',
            resizable: false,
            sortable: true
          },
          {
            Cell: this.renderDropdownColumn,
            Header: 'Actions',
            className: 'table-actions',
            filterable: false,
            headerClassName: 'table-actions',
            resizable: false,
            sortable: false
          }
        ]}
        defaultSorted={[
          {
            desc: false,
            id: 'key.name'
          }
        ]}
      />
    );
  }

  private renderDropdownColumn = (row: IRow) => {
    const key = row.original.key;

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
