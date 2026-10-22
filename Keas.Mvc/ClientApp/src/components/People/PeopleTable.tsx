import * as React from 'react';
import { useMemo } from 'react';
import { Button } from 'reactstrap';
import { IPerson, IPersonInfo } from '../../models/People';
import { ReactTableUtil } from '../../util/tableUtil';
import { ReactTable } from '../Shared/ReactTable';
import {
  PeaksColumn as Column,
  PeaksInitialState
} from '../Shared/tableFeatures';

interface IProps {
  filtered: any[];
  people: IPersonInfo[];
  onRevoke?: (equipment: IPerson) => void;
  onAdd?: (equipment: IPerson) => void;
  showDetails?: (equipment: IPersonInfo) => void;
  onEdit?: (equipment: IPerson) => void;
  updateFilters: (filters: any[]) => void;
}

const PeopleTable = (props: IProps) => {
  const columns: Column<IPersonInfo>[] = useMemo(
    () => [
      {
        cell: data => (
          <Button
            color='link'
            onClick={() => props.showDetails(data.row.original)}
          >
            Details
          </Button>
        ),
        header: ' '
      },
      {
        header: 'Name',
        accessorFn: row => `${row.person.lastName}, ${row.person.firstName}`,
        filterFn: 'includesString',
        id: 'name'
      },
      {
        header: 'Email',
        accessorFn: row => row.person.email
      },
      {
        header: 'Supervisor',
        accessorFn: row =>
          row.person?.supervisor
            ? `${row.person.supervisor.lastName}, ${row.person.supervisor.firstName}`
            : ``
      },
      {
        header: 'Keys',
        accessorKey: 'keyCount',
        enableColumnFilter: false
      },
      {
        header: 'Equipment',
        accessorKey: 'equipmentCount',
        enableColumnFilter: false
      },
      {
        header: 'Access',
        accessorKey: 'accessCount',
        enableColumnFilter: false
      },
      {
        header: 'Workstations',
        accessorKey: 'workstationCount',
        enableColumnFilter: false
      }
    ],
    []
  );

  const peopleData = useMemo(() => props.people, [props.people]);

  const initialState: PeaksInitialState = {
    sorting: [{ id: 'name', desc: false }],
    pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
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
