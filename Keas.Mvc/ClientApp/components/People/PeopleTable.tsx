import * as React from 'react';
import { Button } from 'reactstrap';
import { IPerson, IPersonInfo } from '../../models/People';
import { ReactTableUtil } from '../../util/tableUtil';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  filtered: any[];
  people: IPersonInfo[];
  onRevoke?: (equipment: IPerson) => void;
  onAdd?: (equipment: IPerson) => void;
  showDetails?: (equipment: IPerson) => void;
  onEdit?: (equipment: IPerson) => void;
  updateFilters: (filters: any[]) => void;
}

export default class PeopleTable extends React.Component<IProps, {}> {
  public render() {
    const columns: Column<IPersonInfo>[] = [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => this.props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        Header: 'Details',
        maxWidth: 150
      },
      {
        Header: 'Name',
        id: 'name',
        accessor: row => row.person.lastName + ', ' + row.person.firstName,
        filter: 'contains'
      },
      {
        Header: 'Email',
        accessor: row => row.person.email
      },
      {
        Header: 'Supervisor',
        accessor: row => row.person.supervisor?.name
      },
      {
        Header: 'Keys',
        accessor: 'keyCount',
        disableFilters: true
      },
      {
        Header: 'Equipment',
        accessor: 'equipmentCount',
        disableFilters: true
      },
      {
        Header: 'Access',
        accessor: 'accessCount',
        disableFilters: true
      },
      {
        Header: 'Workstations',
        accessor: 'workstationCount',
        disableFilters: true
      }
    ];

    const initialState: Partial<TableState<any>> = {
      sortBy: [{ id: 'name' }],
      pageSize: ReactTableUtil.getPageSize()
    };

    // return <h1>Hi</h1>;
    return (
      <ReactTable
        columns={columns}
        data={this.props.people}
        initialState={initialState}
      />
    );
  }
}
