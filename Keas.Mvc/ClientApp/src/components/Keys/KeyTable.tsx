import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';
import { ReactTableKeySerialUtil } from '../../util/reactTable';

interface IProps {
  showDetails?: (key: IKey) => void;
  onEdit?: (key: IKey) => void;
  onDelete?: (key: IKey) => void;
  keysInfo: IKeyInfo[];
  filters: any[];
  onFiltersChange: (filters: any[]) => void;
}

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
        Header: ' ',
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
        Filter: ReactTableKeySerialUtil.FilterHeader,
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
        id: 'serialsCount',
        disableSortBy: true
      },
      {
        Cell: data => <span>{data.row.original.spacesCount}</span>,
        Header: 'Spaces',
        accessor: 'spacesCount',
        disableFilters: true
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
        filterTypes={{ serial: ReactTableKeySerialUtil.filterFunction }}
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
