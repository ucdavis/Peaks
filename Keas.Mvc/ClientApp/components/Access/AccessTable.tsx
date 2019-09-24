import * as React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Button } from 'reactstrap';
import { IAccess } from '../../Types';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';

interface IProps {
  accesses: IAccess[];
  onRevoke?: (access: IAccess) => void;
  onDelete?: (access: IAccess) => void;
  onAdd?: (access: IAccess) => void;
  showDetails?: (access: IAccess) => void;
  onEdit?: (access: IAccess) => void;
}

export default class AccessTable extends React.Component<IProps, {}> {
  public render() {
    return (
      <ReactTable
        data={this.props.accesses}
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
            Header: 'Name',
            accessor: 'name',
            filterMethod: (filter, row) =>
              !!row[filter.id] &&
              row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
          },
          {
            Header: 'Number of Assignments',
            accessor: x => x.assignments.length,
            filterable: false,
            id: 'numAssignments',
            sortable: true
          },
          {
            Header: 'Assigned To',
            accessor: x => x.assignments.map(a => a.person.name).join(','),
            filterMethod: (filter, row) => {
              const namesAndEmail = row._original.assignments.map(
                x => x.person.name.toLowerCase() + x.person.email.toLowerCase()
              );
              if (
                namesAndEmail.some(x => x.includes(filter.value.toLowerCase()))
              ) {
                return true;
              }
            },
            id: 'assignedTo'
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
            accessor: x =>
              DateUtil.getFirstExpiration(x.assignments.map(y => y.expiresAt)),
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
      />
    );
  }

  private renderDropdownColumn = row => {
    const accessEntity: IAccess = row.original;

    const actions: IAction[] = [];

    if (!!this.props.onAdd) {
      actions.push({
        title: 'Assign',
        onClick: () => this.props.onAdd(accessEntity)
      });
    }

    if (!!this.props.onDelete) {
      actions.push({
        title: 'Delete',
        onClick: () => this.props.onDelete(accessEntity)
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };
}
