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
        Header: 'Actions',
        maxWidth: 150,
      },
      { Header: 'PersonId', accessor: 'keyCount' },
      {
        Header: 'Name',
        accessor: row => row.person.lastName + ', ' + row.person.firstName
      }
    ];

    const initialState: Partial<TableState<any>> = {
      sortBy: [{ id: 'keyCount' }],

    };

    // return <h1>Hi</h1>;
    return <ReactTable columns={columns} data={this.props.people} />;
  }
}
