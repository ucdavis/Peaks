import * as React from 'react';
import { Button } from 'reactstrap';
import { IKeySerial } from '../../models/KeySerials';
import { DateUtil } from '../../util/dates';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { PeaksColumn as Column, PeaksInitialState } from '../Shared/tableFeatures';
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
        header: 'Key Code and SN',
        accessorFn: (keySerial: IKeySerial) => {
          return keySerial.key.code + '-' + keySerial.number;
        },
        id: 'keyCodeSN'
      },
      {
        meta: { Filter: ReactTableKeyStatusUtil.FilterHeader },
        filterFn: ReactTableKeyStatusUtil.filterFunction,
        header: 'Status',
        accessorKey: 'status'
      },
      {
        header: 'Assignment',
        accessorFn: (keySerial: IKeySerial) =>
          !!keySerial.keySerialAssignment
            ? `${keySerial.keySerialAssignment.person.lastName}, ${keySerial.keySerialAssignment.person.firstName}`
            : ``,
        id: 'assignedTo'
      },
      {
        cell: row => (
          <span>{row.getValue() ? DateUtil.formatExpiration(row.getValue()) : ''}</span>
        ),
        meta: { Filter: ReactTableExpirationUtil.FilterHeader },
        filterFn: ReactTableExpirationUtil.filterFunction,
        header: 'Expiration',
        accessorFn: row => row.keySerialAssignment?.expiresAt,
        id: 'expiresAt'
      },
      {
        cell: renderDropdownColumn,
        header: 'Actions'
      }
    ],
    []
  );

  const keySerialData = React.useMemo(() => keySerials, [keySerials]);

  const initialState: PeaksInitialState = {
    sorting: [{ id: 'status', desc: false }, { id: 'keyCodeSN', desc: false }],
    pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
  };

  return (
    <ReactTable
      data={keySerialData}
      columns={columns}
      initialState={initialState}
    />
  );
};

export default KeySerialTable;
