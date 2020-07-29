import * as React from 'react';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import {
  ExpirationColumnFilter,
  expirationFilter,
  ReactTableExpirationUtil
} from '../../util/reactTable';
import { ReactTable } from '../Shared/ReactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import { Column, TableState } from 'react-table';

interface IProps {
  assignments: IAccessAssignment[];
  onRevoke?: (assignment: IAccessAssignment) => void;
  disableEditing?: boolean;
}

const accessAssignTable: React.FunctionComponent<IProps> = (
  props: React.PropsWithChildren<IProps>
): React.ReactElement => {
  const options = [...ReactTableExpirationUtil.defaultFilterOptions];
  options.splice(
    options.findIndex(v => v.value === 'unassigned'),
    1
  );

  const columns: Column<IAccessAssignment>[] = [
    {
      Header: 'Name',
      accessor: row => row.person?.name
    },
    {
      Cell: row => (
        <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
      ),
      Filter: ExpirationColumnFilter,
      filter: 'expiration',
      Header: 'Expiration',
      accessor: 'expiresAt'
    },
    {
      Cell: row => (
        <button
          type='button'
          className='btn btn-outline-danger'
          disabled={props.disableEditing || !props.onRevoke}
          onClick={() =>
            props.onRevoke &&
            props.onRevoke(
              props.assignments.find(
                (el: IAccessAssignment) => row.value === el.personId
              )
            )
          }
        >
          <i className='fas fa-trash' />
        </button>
      ),
      Header: 'Revoke',
      accessor: 'personId'
    }
  ];

  const initialState: Partial<TableState<any>> = {
    sortBy: [{ id: 'name' }],
    pageSize: ReactTableUtil.getPageSize()
  };

  return (
    <div>
      <h3>Assigned to:</h3>
      <ReactTable
        data={props.assignments}
        columns={columns}
        initialState={initialState}
        filterTypes={{ expiration: expirationFilter }}
      />
    </div>
  );
};

export default accessAssignTable;
