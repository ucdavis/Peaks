import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';

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
    const columns = [
      {
        Cell: row => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(row.original)}
          >
            Details
          </Button>
        ),
        Header: 'Actions',
        maxWidth: 150,
      },
      {
        Header: 'Serial Number',
        accessor: 'serialNumber',
        id: 'serial number',
        filter: 'contains'
      },
      {
        Header: 'Name',
        accessor: 'name',
        filter: 'contains'
      },
      {
        Header: 'Assigned To',
        accessor: 'assignment.person.name'
      },
    ];

    // [
    //   {
    //     Cell: row => (
    //       <span>
    //         {row.value ? DateUtil.formatExpiration(row.value) : ''}
    //       </span>
    //     ),
    //     Filter: ({ filter, onChange }) =>
    //       ReactTableExpirationUtil.filter(filter, onChange),
    //     Header: 'Expiration',
    //     accessor: 'assignment.expiresAt',
    //     filterMethod: (filter, row) =>
    //       ReactTableExpirationUtil.filterMethod(filter, row),
    //     id: 'expiresAt',
    //     sortMethod: (a, b) => ReactTableExpirationUtil.sortMethod(a, b)
    //   },
    //   {
    //     Cell: this.renderDropdownColumn,
    //     Header: 'Actions',
    //     className: 'table-actions',
    //     filterable: false,
    //     headerClassName: 'table-actions',
    //     resizable: false,
    //     sortable: false
    //   }
    // ]
    return (
      <ReactTable
        data={this.props.equipment}
        columns={columns}
      />
    );
  }

  private renderDropdownColumn = row => {
    const equipmentEntity: IEquipment = row.original;
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
