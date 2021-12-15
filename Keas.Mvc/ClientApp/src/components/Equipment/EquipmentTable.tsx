import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import {
  ExpirationColumnFilter,
  expirationFilter
} from '../../util/reactTable';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';

interface IProps {
  equipment: IEquipment[];
  onRevoke?: (equipment: IEquipment) => void;
  onDelete?: (equipment: IEquipment) => void;
  onAdd?: (equipment: IEquipment) => void;
  showDetails?: (equipment: IEquipment) => void;
  onEdit?: (equipment: IEquipment) => void;
}

const EquipmentTable = (props: IProps) => {
  const renderDropdownColumn = data => {
    const equipmentEntity: IEquipment = data.row.original;
    const hasAssignment = !!equipmentEntity.assignment;

    const actions: IAction[] = [];

    if (!!props.onAdd && !hasAssignment) {
      actions.push({
        onClick: () => props.onAdd(equipmentEntity),
        title: 'Assign'
      });
    }

    if (!!props.onRevoke && hasAssignment) {
      actions.push({
        onClick: () => props.onRevoke(equipmentEntity),
        title: 'Revoke'
      });
    }

    if (!!props.onDelete) {
      actions.push({
        onClick: () => props.onDelete(equipmentEntity),
        title: 'Delete'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };

  const columns: Column<IEquipment>[] = React.useMemo(
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
        Header: 'Serial Number',
        accessor: 'serialNumber',
        id: 'serial number'
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Assigned To',
        accessor: e => e.assignment?.person?.name
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ExpirationColumnFilter,
        filter: 'expiration',
        Header: 'Expiration',
        accessor: e => e.assignment?.expiresAt,
        id: 'expiresAt'
      },
      {
        Cell: renderDropdownColumn,
        Header: 'Actions',
        defaultCanFilter: false
      }
    ],
    []
  );

  const equipmentData = React.useMemo(() => props.equipment, [props.equipment]);

  const initialState: Partial<TableState<any>> = {
    sortBy: [{ id: 'name' }],
    pageSize: ReactTableUtil.getPageSize()
  };

  return (
    <ReactTable
      data={equipmentData}
      columns={columns}
      initialState={initialState}
      filterTypes={{ expiration: expirationFilter }}
    />
  );
};

export default EquipmentTable;
