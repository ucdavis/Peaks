import * as React from 'react';
import { useMemo } from 'react';
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

const PeopleTable = (props: IProps) => {
  const columns: Column<IPersonInfo>[] = useMemo(
    () => [
      {
        Cell: data => (
          <Button
            color='link'
            onClick={() => props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        Header: ' ',
        maxWidth: 150
      },
      {
        Header: 'Name',
        accessor: row => `${row.person.lastName}, ${row.person.firstName}`,
        filter: 'contains',
        id: 'name'
      },
      {
        Header: 'Email',
        accessor: row => row.person.email
      },
      {
        Header: 'Supervisor',
        accessor: row =>
          `${row.person.supervisor?.lastName}, ${row.person.supervisor?.firstName}`
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
    ],
    []
  );

  const peopleData = useMemo(() => props.people, [props.people]);

  const initialState: Partial<TableState<any>> = {
    sortBy: [{ id: 'name' }],
    pageSize: ReactTableUtil.getPageSize()
  };

  return (
    <ReactTable
      columns={columns}
      data={peopleData}
      initialState={initialState}
    />
  );
};

export default PeopleTable;
