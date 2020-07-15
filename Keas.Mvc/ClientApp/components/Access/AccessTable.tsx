import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccess } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column } from 'react-table';

interface IProps {
  accesses: IAccess[];
  onDelete?: (access: IAccess) => void;
  onAdd?: (access: IAccess) => void;
  showDetails?: (access: IAccess) => void;
  onEdit?: (access: IAccess) => void;
}

export default class AccessTable extends React.Component<IProps, {}> {
  public render() {
    // const columns: Column<IAccess>[] = [
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
        maxWidth: 150
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Number of Assignments',
        accessor: x => x.assignments.length,
        id: 'numAssignments'
      },
      {
        Header: 'Assigned To',
        accessor: x => x.assignments.map(a => a.person.name).join(','),
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
