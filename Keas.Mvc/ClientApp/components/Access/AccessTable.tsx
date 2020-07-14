import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';

interface IProps {
  accesses: IAccess[];
  onDelete?: (access: IAccess) => void;
  onAdd?: (access: IAccess) => void;
  showDetails?: (access: IAccess) => void;
  onEdit?: (access: IAccess) => void;
}

export default class AccessTable extends React.Component<IProps, {}> {
  public render() {
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
        Header: 'Access',
        filterable: false,
        maxWidth: 150,
        resizable: false,
        sortable: false
      },
      {
        Header: 'Name',
        accessor: 'name',
        filter: 'contains'
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
          if (namesAndEmail.some(x => x.includes(filter.value.toLowerCase()))) {
            return true;
          }
        },
        id: 'assignedTo'
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
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
    ];

    return (
      <ReactTable
        data={this.props.accesses}
        filterable={true}
        defaultPageSize={ReactTableUtil.getPageSize()}
        onPageSizeChange={pageSize => {
          ReactTableUtil.setPageSize(pageSize);
        }}
        minRows={1}
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
    const accessEntity: IAccess = data.row.original;
    const actions: IAction[] = [];

    if (!!this.props.onAdd) {
      actions.push({
        onClick: () => this.props.onAdd(accessEntity),
        title: 'Assign'
      });
    }

    if (!!this.props.onDelete) {
      actions.push({
        onClick: () => this.props.onDelete(accessEntity),
        title: 'Delete'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };
}
