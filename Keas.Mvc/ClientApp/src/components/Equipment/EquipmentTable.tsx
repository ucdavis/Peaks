import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';
import { ReactTableUtil } from '../../util/tableUtil';
import ListActionsDropdown, { IAction } from '../ListActionsDropdown';
import { ReactTable } from '../Shared/ReactTable';
import { Column, TableState } from 'react-table';
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

    if (!!props.onDelete) {
      actions.push({
        onClick: () => props.onDelete(equipmentEntity),
        title: 'Delete'
      });
    }

    if (!!props.onDuplicate) {
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
        accessor: e =>
          !!e.assignment?.person
            ? `${e.assignment?.person?.lastName}, ${e.assignment?.person?.firstName}`
            : ``
      },
      {
        Cell: row => (
          <span>{row.value ? DateUtil.formatExpiration(row.value) : ''}</span>
        ),
        Filter: ReactTableExpirationUtil.FilterHeader,
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
      filterTypes={{ expiration: ReactTableExpirationUtil.filterFunction }}
    />
  );
};

export default EquipmentTable;
