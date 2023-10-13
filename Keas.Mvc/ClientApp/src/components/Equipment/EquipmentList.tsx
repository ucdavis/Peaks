import * as React from 'react';
import { IEquipment } from '../../models/Equipment';
import EquipmentListItem from './EquipmentListItem';

interface IProps {
  equipment: IEquipment[];
  onRevoke?: (equipment: IEquipment) => void;
  onDelete?: (equipment: IEquipment) => void;
  onAdd?: (equipment: IEquipment) => void;
  showDetails?: (equipment: IEquipment) => void;
  onEdit?: (equipment: IEquipment) => void;
  onDuplicate?: (equipment: IEquipment) => void;
}

const EquipmentList = (props: IProps) => {
  const equipment =
    !props.equipment || props.equipment.length < 1 ? (
      <tr>
        <td colSpan={5}>No Equipment Found</td>
      </tr>
    ) : (
      props.equipment.map(x => (
        <EquipmentListItem
          key={x.id.toString()}
          equipmentEntity={x}
          onRevoke={props.onRevoke}
          onDelete={props.onDelete}
          onAdd={props.onAdd}
          showDetails={props.showDetails}
          onEdit={props.onEdit}
          onDuplicate={props.onDuplicate}
        />
      ))
    );
  return (
    <div className='table'>
      <table className='table'>
        <thead>
          <tr>
            <th />
            <th>Serial</th>
            <th>Name</th>
            <th>Assigned To</th>
            <th>Expiration</th>
            <th className='list-actions'>Actions</th>
          </tr>
        </thead>
        <tbody>{equipment}</tbody>
      </table>
    </div>
  );
};

export default EquipmentList;
