import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import {
  PeaksColumn as Column,
  PeaksInitialState
} from '../Shared/tableFeatures';
import { ReactTableExpirationUtil } from '../../util/reactTable';

interface IProps {
  equipment: IEquipment[];
  onRevoke?: (equipment: IEquipment) => void;
  onDelete?: (equipment: IEquipment) => void;
  onAdd?: (equipment: IEquipment) => void;
  showDetails?: (equipment: IEquipment) => void;
  onEdit?: (equipment: IEquipment) => void;
  onDuplicate?: (equipment: IEquipment) => void;
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

    if (props.onDelete) {
      actions.push({
        onClick: () => props.onDelete(equipmentEntity),
        title: 'Delete'
      });
    }

    if (props.onDuplicate) {
      actions.push({
        onClick: () => props.onDuplicate(equipmentEntity),
        title: 'Duplicate'
      });
    }

    return <ListActionsDropdown actions={actions} />;
  };

  const columns: Column<IEquipment>[] = React.useMemo(
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
        header: 'Serial Number',
        accessorKey: 'serialNumber',
        id: 'serial number'
      },
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Assigned To',
        accessorFn: e =>
          e.assignment?.person
            ? `${e.assignment?.person?.lastName}, ${e.assignment?.person?.firstName}`
            : ``
      },
      {
        cell: row => (
          <span>
            {row.getValue() ? DateUtil.formatExpiration(row.getValue()) : ''}
          </span>
        ),
        meta: { Filter: ReactTableExpirationUtil.FilterHeader },
        filterFn: ReactTableExpirationUtil.filterFunction,
        header: 'Expiration',
        accessorFn: e => e.assignment?.expiresAt,
        id: 'expiresAt'
      },
      {
        cell: renderDropdownColumn,
        header: 'Actions',
        enableColumnFilter: false
      }
    ],
    []
  );

  const equipmentData = React.useMemo(() => props.equipment, [props.equipment]);

  const initialState: PeaksInitialState = {
    sorting: [{ id: 'name', desc: false }],
    pagination: { pageIndex: 0, pageSize: ReactTableUtil.getPageSize() }
  };

  return (
    <ReactTable
      data={equipmentData}
      columns={columns}
      initialState={initialState}
    />
  );
};

export default EquipmentTable;
