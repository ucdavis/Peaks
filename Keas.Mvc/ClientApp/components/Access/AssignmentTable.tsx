import * as React from 'react';
import ReactTable from 'react-table';
import { DateUtil } from '../../util/dates';
import { ReactTableExpirationUtil } from '../../util/reactTable';
import { IAccessAssignment } from 'ClientApp/Types';

interface IProps {
  assignments: Array<IAccessAssignment>;
  onRevoke: (assignment: IAccessAssignment) => void;
  disableEditing?: boolean;
}

const AccessAssignTable: React.FunctionComponent<IProps> = (
  props: React.PropsWithChildren<IProps>
): React.ReactElement => {
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
        ReactTableExpirationUtil.filter(filter, onChange),
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
            props.onRevoke(
              props.assignments.find(
                (el: IAccessAssignment) => row.value == el.personId
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

export default AccessAssignTable;
