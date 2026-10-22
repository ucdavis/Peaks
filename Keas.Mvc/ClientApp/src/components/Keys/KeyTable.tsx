import { InformationCircleIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { IKey, IKeyInfo } from '../../models/Keys';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import {
  PeaksColumn as Column,
  PeaksInitialState
} from '../Shared/tableFeatures';
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
        cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original.key)}
          >
            Details
          </Button>
        ),
        header: ' '
      },
      {
        header: 'Key Name',
        id: 'name',
        accessorFn: row => row.key.name
      },
      {
        header: 'Key Code',
        accessorFn: row => row.key.code
      },
      {
        cell: row => (
          <span>
            {row.getValue().serialsInUse} / {row.getValue().serialsTotal}
          </span>
        ),
        meta: { Filter: ReactTableKeySerialUtil.FilterHeader },
        filterFn: ReactTableKeySerialUtil.filterFunction,
        header: _ => (
          <div>
            Serials <InformationCircleIcon data-icon="information-circle" id='serialTooltip' className='hero-icon size-5' />
            <UncontrolledTooltip placement='right' target='serialTooltip'>
              In Use / Total
            </UncontrolledTooltip>
          </div>
        ),
        accessorFn: keyInfo => {
          return {
            serialsInUse: keyInfo.serialsInUseCount,
            serialsTotal: keyInfo.serialsTotalCount
          };
        },
        id: 'serialsCount',
        enableSorting: false
      },
      {
        cell: data => <span>{data.row.original.spacesCount}</span>,
        header: 'Spaces',
        accessorKey: 'spacesCount',
        enableColumnFilter: false
      },
      {
        cell: this.renderDropdownColumn,
        header: 'Actions'
      }
    ];

    const initialState: PeaksInitialState = {
      sorting: [{ id: 'name', desc: false }],
      pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
    };

    return (
      <ReactTable
        data={keysInfo}
        columns={columns}
        initialState={initialState}
      />
    );
  }

  private renderDropdownColumn = data => {
    const key = data.row.original.key;

    const actions: IAction[] = [];

    if (this.props.onDelete) {
      actions.push({
        onClick: () => this.props.onDelete(key),
        title: 'Delete'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };
}
