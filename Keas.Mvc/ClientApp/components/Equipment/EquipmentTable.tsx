import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column } from 'react-table';

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
    // const columns: Column<IEquipment>[] = [
    const columns = [
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
        maxWidth: 150,
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
        accessor: row => row.assignment?.person?.name
      },
      {
        Cell: row => (
          <span>
            {row.value ? DateUtil.formatExpiration(row.value) : ''}
          </span>
        ),
        Filter: ({ filter, onChange }) =>
          ReactTableExpirationUtil.filter(filter, onChange),
        Header: 'Expiration',
        accessor: row => row.assignment?.expiresAt,
        // accessor: 'assignment.expiresAt',
        filterMethod: (filter, row) =>
          ReactTableExpirationUtil.filterMethod(filter, row),
        id: 'expiresAt',
        sortMethod: (a, b) => ReactTableExpirationUtil.sortMethod(a, b)
      },
      {
        Cell: this.renderDropdownColumn,
        Header: 'Actions',
      }
    ];

    return (
      <ReactTable
        data={this.props.equipment}
        columns={columns}
        defaultSorted={[
          {
            desc: false,
            id: 'name'
          }
        ]}
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
