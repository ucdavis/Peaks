import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import { ExpirationColumnFilter, expirationFilter } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  equipment: IEquipment[];
  onRevoke?: (equipment: IEquipment) => void;
  onDelete?: (equipment: IEquipment) => void;
  onAdd?: (equipment: IEquipment) => void;
  showDetails?: (equipment: IEquipment) => void;
  onEdit?: (equipment: IEquipment) => void;
}

export default class EquipmentTable extends React.Component<IProps, {}> {
  public render() {
    const columns: Column<IEquipment>[] = [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        Header: 'Equipment Actions',
        maxWidth: 150
      },
      {
        Header: 'Serial Number',
        accessor: 'serialNumber',
        id: 'serial number',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Assigned To',
        accessor: e => e.assignment?.person?.name
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ExpirationColumnFilter,
        filter: 'expiration',
        Header: 'Expiration',
        accessor: e => e.assignment?.expiresAt,
        id: 'expiresAt'
      },
      {
        Cell: this.renderDropdownColumn,
        Header: 'Actions',
        defaultCanFilter: false
      }
    ];

    const initialState: Partial<TableState<any>> = {
      sortBy: [{ id: 'name' }],
      pageSize: ReactTableUtil.getPageSize()
    };

    return (
      <ReactTable
        data={this.props.equipment}
        columns={columns}
        initialState={initialState}
        filterTypes={{ expiration: expirationFilter }}
      />
    );
  }

  private renderDropdownColumn = data => {
    const equipmentEntity: IEquipment = data.row.original;
    const hasAssignment = !!equipmentEntity.assignment;

    const actions: IAction[] = [];

    if (!!this.props.onAdd && !hasAssignment) {
      actions.push({
        onClick: () => this.props.onAdd(equipmentEntity),
        title: 'Assign'
      });
    }

    if (!!this.props.onRevoke && hasAssignment) {
      actions.push({
        onClick: () => this.props.onRevoke(equipmentEntity),
        title: 'Revoke'
      });
    }

    if (!!this.props.onDelete) {
      actions.push({
        onClick: () => this.props.onDelete(equipmentEntity),
        title: 'Delete'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };
}
