import * as React from 'react';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { ReactTable } from '../Shared/ReactTable';

interface IProps {
  assignments: IAccessAssignment[];
  onRevoke?: (assignment: IAccessAssignment) => void;
  disableEditing?: boolean;
}

const accessAssignTable: React.FunctionComponent<IProps> = (
  props: React.PropsWithChildren<IProps>
): React.ReactElement => {
  const options = [...ReactTableExpirationUtil.defaultFilterOptions];
  options.splice(options.findIndex(v => v.value === 'unassigned'), 1);

  const columns = [
    {
      Header: 'Name',
      accessor: 'person.name',
      filterMethod: (filter, row) =>
        !!row[filter.id] &&
        row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
      filterable: true
    },
    {
      Cell: row => (
        <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
      ),
      Filter: ({ filter, onChange }) =>
        ReactTableExpirationUtil.getFilter(options)(filter, onChange),
      Header: 'Expiration',
      accessor: 'expiresAt',
      filterMethod: (filter, row) =>
        ReactTableExpirationUtil.filterMethod(filter, row),
      filterable: true,
      sortMethod: (a, b) => ReactTableExpirationUtil.sortMethod(a, b)
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
      accessor: 'personId',
      className: 'table-actions',
      filterable: false,
      headerClassName: 'table-actions',
      resizable: false,
      sortable: false
    }
  ];
  return (
    <div>
      <h3>Assigned to:</h3>
      <ReactTable data={props.assignments} columns={columns} minRows={1} />
    </div>
  );
};

export default accessAssignTable;
