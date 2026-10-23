import * as React from 'react';
import { useState } from 'react';
import { IEquipment } from '../../models/Equipment';
import EquipmentTable from './EquipmentTable';
import { AssetFilterBar } from '../Shared/AssetFilterBar';

interface IProps {
  equipment: IEquipment[];
  equipmentAvailabilityLevels: string[];
  equipmentProtectionLevels: string[];
  equipmentTypes: string[];
  teamSpaces: string[];
  tags: string[];
  openRevokeModal?: (equipment: IEquipment) => void;
  openDeleteModal?: (equipment: IEquipment) => void;
  openAssignModal?: (equipment: IEquipment) => void;
  openDetailsModal?: (equipment: IEquipment) => void;
  openEditModal?: (equipment: IEquipment) => void;
  openDuplicateModal?: (equipment: IEquipment) => void;
}

const EquipmentTableContainer = (props: IProps) => {
  // state. array of strings from each filter's selected values
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [attributeFilters, setAttributeFilters] = useState<string[]>([]);
  const [equipmentTypeFilters, setEquipmentTypeFilters] = useState<string[]>(
    []
  );
  const [equipmentProtectionFilters, setEquipmentProtectionFilters] = useState<
    string[]
  >([]);
  const [
    equipmentAvailabilityFilters,
    setEquipmentAvailabilityFilters
  ] = useState<string[]>([]);
  const [managedSystemFilters, setManagedSystemFilters] = useState<string[]>(
    []
  );
  const [makeFilters, setMakeFilters] = useState<string[]>([]);
  const [modelFilters, setModelFilters] = useState<string[]>([]);
  const [teamSpacesFilters, setTeamSpacesFilters] = useState<string[]>([]);

  const filterOptions = React.useMemo(() => {
    const unique = (values: string[]) =>
      Array.from(new Set(values.filter(Boolean))).sort();
    return {
      attributes: unique(
        props.equipment.flatMap(item =>
          (item.attributes || []).flatMap(attribute => [
            attribute.key,
            attribute.value
          ])
        )
      ),
      managedSystem: unique(
        props.equipment.map(item => item.systemManagementId)
      ),
      make: unique(props.equipment.map(item => item.make)),
      model: unique(props.equipment.map(item => item.model))
    };
  }, [props.equipment]);

  // filter functions
  const checkTagFilters = (equipment: IEquipment, filters: string[]) => {
    return filters.every(
      f => !!equipment && !!equipment.tags && equipment.tags.includes(f)
    );
  };
  const checkAttributeFilters = (equipment: IEquipment, filters: string[]) => {
    for (const filter of filters) {
      // make sure the equipment has attributes, and that the filter matches
      // either the key or the value of one of the attributes
      if (
        !!equipment.attributes &&
        equipment.attributes.findIndex(
          x =>
            //indexOf() will return -1 if the substring is not found
            x.key.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
            (!!x.value && // have to check that value exists. attributes can have a key with no value
              x.value.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
          // findIndex() will return -1 if there is not an element of the array where the above condition is true
        ) !== -1
      ) {
        return true;
      }
    }
    return false;
  };
  const checkEquipmentTypeFilters = (equipment: IEquipment) => {
    const filters = equipmentTypeFilters;
    return filters.some(
      f =>
        (equipment && !!equipment.type && equipment.type === f) ||
        (equipment && !equipment.type && f === 'Default')
    );
  };
  const checkEquipmentProtectionFilters = (equipment: IEquipment) => {
    const filters = equipmentProtectionFilters;
    return filters.some(
      f =>
        equipment &&
        !!equipment.protectionLevel &&
        equipment.protectionLevel === f
    );
  };
  const checkEquipmentAvailabilityFilters = (equipment: IEquipment) => {
    const filters = equipmentAvailabilityFilters;
    return filters.some(
      f =>
        equipment &&
        !!equipment.availabilityLevel &&
        equipment.availabilityLevel === f
    );
  };
  const checkManagedSystemFilters = (equipment: IEquipment) => {
    const filters = managedSystemFilters;
    return filters.some(
      f =>
        equipment &&
        !!equipment.systemManagementId &&
        equipment.systemManagementId.includes(f)
    );
  };
  const checkMakeFilters = (equipment: IEquipment) => {
    const filters = makeFilters;
    return filters.some(
      f =>
        equipment &&
        !!equipment.make &&
        equipment.make.toLowerCase().includes(f.toLowerCase())
    );
  };
  const checkModelFilters = (equipment: IEquipment) => {
    const filters = modelFilters;
    return filters.some(
      f =>
        equipment &&
        !!equipment.model &&
        equipment.model.toLowerCase().includes(f.toLowerCase())
    );
  };
  const checkTeamSpacesFilters = (equipment: IEquipment) => {
    const filters = teamSpacesFilters;
    return filters.some(
      f =>
        equipment &&
        !!equipment.space &&
        // matches exactly from our list of options
        // TODO: allow for partial matches, e.g. search for all equipment in a building
        f
          .toLowerCase()
          .includes(
            `${equipment.space.roomNumber} ${equipment.space.bldgName}`.toLowerCase()
          )
    );
  };

  // actually filter equipment list
  let filteredEquipment = props.equipment;
  if (tagFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkTagFilters(x, tagFilters)
    );
  }
  if (attributeFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkAttributeFilters(x, attributeFilters)
    );
  }
  if (equipmentTypeFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkEquipmentTypeFilters(x)
    );
  }
  if (equipmentProtectionFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkEquipmentProtectionFilters(x)
    );
  }
  if (equipmentAvailabilityFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkEquipmentAvailabilityFilters(x)
    );
  }
  if (managedSystemFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkManagedSystemFilters(x)
    );
  }
  if (makeFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x => checkMakeFilters(x));
  }
  if (modelFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x => checkModelFilters(x));
  }
  if (teamSpacesFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkTeamSpacesFilters(x)
    );
  }

  return (
    <div>
      <AssetFilterBar
        categories={[
          {
            id: 'tags',
            label: 'Tags',
            options: props.tags,
            selected: tagFilters,
            onChange: setTagFilters
          },
          {
            id: 'attributes',
            label: 'Attributes',
            options: filterOptions.attributes,
            selected: attributeFilters,
            onChange: setAttributeFilters,
            allowCustom: true
          },
          {
            id: 'type',
            label: 'Equipment type',
            options: props.equipmentTypes,
            selected: equipmentTypeFilters,
            onChange: setEquipmentTypeFilters
          },
          {
            id: 'protection',
            label: 'Protection level',
            options: props.equipmentProtectionLevels,
            selected: equipmentProtectionFilters,
            onChange: setEquipmentProtectionFilters
          },
          {
            id: 'availability',
            label: 'Availability level',
            options: props.equipmentAvailabilityLevels,
            selected: equipmentAvailabilityFilters,
            onChange: setEquipmentAvailabilityFilters
          },
          {
            id: 'managed-system',
            label: 'Managed system ID',
            options: filterOptions.managedSystem,
            selected: managedSystemFilters,
            onChange: setManagedSystemFilters,
            allowCustom: true
          },
          {
            id: 'make',
            label: 'Make',
            options: filterOptions.make,
            selected: makeFilters,
            onChange: setMakeFilters,
            allowCustom: true
          },
          {
            id: 'model',
            label: 'Model',
            options: filterOptions.model,
            selected: modelFilters,
            onChange: setModelFilters,
            allowCustom: true
          },
          {
            id: 'spaces',
            label: 'Team space',
            options: props.teamSpaces,
            selected: teamSpacesFilters,
            onChange: setTeamSpacesFilters
          }
        ]}
      />
      <EquipmentTable
        equipment={filteredEquipment}
        onRevoke={props.openRevokeModal}
        onDelete={props.openDeleteModal}
        onAdd={props.openAssignModal}
        showDetails={props.openDetailsModal}
        onEdit={props.openEditModal}
        onDuplicate={props.openDuplicateModal}
      />
    </div>
  );
};

export default EquipmentTableContainer;
