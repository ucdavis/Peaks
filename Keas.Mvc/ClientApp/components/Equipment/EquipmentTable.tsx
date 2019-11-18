import * as React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

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
    return (
      <ReactTable
        data={this.props.equipment}
        filterable={true}
        defaultPageSize={ReactTableUtil.getPageSize()}
        onPageSizeChange={pageSize => {
          ReactTableUtil.setPageSize(pageSize);
        }}
        minRows={1}
        columns={[
          {
            Cell: row => (
              <Button
                color='link'
                onClick={() => this.props.showDetails(row.original)}
              >
                Details
              </Button>
            ),
            Header: '',
            className: 'spaces-details',
            filterable: false,
            headerClassName: 'spaces-details',
            maxWidth: 150,
            resizable: false,
            sortable: false
          },
          {
            Header: 'Serial Number',
            accessor: 'serialNumber',
            filterMethod: (filter, row) =>
              !!row[filter.id] &&
              row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
          },
          {
            Header: 'Name',
            accessor: 'name',
            filterMethod: (filter, row) =>
              !!row[filter.id] &&
              row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
          },
          {
            Header: 'Assigned To',
            accessor: 'assignment.person.name',
            filterMethod: (filter, row) =>
              !!row[filter.id] &&
              row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
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
            accessor: 'assignment.expiresAt',
            filterMethod: (filter, row) =>
              ReactTableExpirationUtil.filterMethod(filter, row),
            id: 'expiresAt',
            sortMethod: (a, b) => ReactTableExpirationUtil.sortMethod(a, b)
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
            id: 'name'
          }
        ]}
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
