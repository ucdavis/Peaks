import * as React from 'react';
import { Button } from 'reactstrap';
import { IPerson, IPersonInfo } from '../../models/People';
import { ReactTableUtil } from '../../util/tableUtil';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';
import { ReactTableExpirationUtil } from '../../util/reactTable';

interface IProps {
  filtered: any[];
  people: IPersonInfo[];
  onRevoke?: (equipment: IPerson) => void;
  onAdd?: (equipment: IPerson) => void;
  showDetails?: (equipment: IPerson) => void;
  onEdit?: (equipment: IPerson) => void;
  updateFilters: (filters: any[]) => void;
}

// Example of a filter, to be moved into react table utils
const selectFilter = ({
  column: { filterValue, setFilter, preFilteredRows, id }
}) => {
  return (
    <select
      onChange={e => setFilter(e.target.value)}
      style={{ width: '100%' }}
      value={filterValue}
    >
      <option value="">All</option>
      <option>0</option>
      <option>1</option>
    </select>
  );
};

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
        Header: 'Actions',
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
        Filter: selectFilter
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
