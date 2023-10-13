import * as React from 'react';
import { Button } from 'reactstrap';
import { IKeySerial } from '../../models/KeySerials';
import { DateUtil } from '../../util/dates';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';
import {
  ReactTableExpirationUtil,
  ReactTableKeyStatusUtil
} from '../../util/reactTable';

interface IProps {
  keySerials: IKeySerial[];
  onAssign?: (keySerial: IKeySerial) => void;
  onRevoke?: (keySerial: IKeySerial) => void;
  onUpdate?: (keySerial: IKeySerial) => void;
  showDetails?: (keySerial: IKeySerial) => void;
  onEdit?: (keySerial: IKeySerial) => void;
}

const KeySerialTable = (props: IProps) => {
  const renderDropdownColumn = data => {
    const keySerial = data.row.original;

    const actions: IAction[] = [];
    if (!!props.onAssign && !keySerial.keySerialAssignment) {
      actions.push({
        onClick: () => props.onAssign(keySerial),
        title: 'Assign'
      });
    }

    if (!!props.onRevoke && !!keySerial.keySerialAssignment) {
      actions.push({
        onClick: () => props.onRevoke(keySerial),
        title: 'Revoke'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };

  const { keySerials } = props;
  const columns: Column<IKeySerial>[] = React.useMemo(
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
        Header: 'Key Code and SN',
        accessor: (keySerial: IKeySerial) => {
          return keySerial.key.code + '-' + keySerial.number;
        },
        id: 'keyCodeSN'
      },
      {
        Filter: ReactTableKeyStatusUtil.FilterHeader,
        filter: 'status',
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'Assignment',
        accessor: (keySerial: IKeySerial) =>
          !!keySerial.keySerialAssignment
            ? `${keySerial.keySerialAssignment.person.lastName}, ${keySerial.keySerialAssignment.person.firstName}`
            : ``,
        id: 'assignedTo'
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ReactTableExpirationUtil.FilterHeader,
        filter: 'expiration',
        Header: 'Expiration',
        accessor: row => row.keySerialAssignment?.expiresAt,
        id: 'expiresAt'
      },
      {
        Cell: renderDropdownColumn,
        Header: 'Actions'
      }
    ],
    []
  );

  const keySerialData = React.useMemo(() => keySerials, [keySerials]);

  const initialState: Partial<TableState<any>> = {
    sortBy: [{ id: 'status' }, { id: 'keyCodeSN' }],
    pageSize: ReactTableUtil.getPageSize()
  };

  return (
    <ReactTable
      data={keySerialData}
      columns={columns}
      initialState={initialState}
      filterTypes={{
        expiration: ReactTableExpirationUtil.filterFunction,
        status: ReactTableKeyStatusUtil.filterFunction
      }}
    />
  );
};

export default KeySerialTable;
