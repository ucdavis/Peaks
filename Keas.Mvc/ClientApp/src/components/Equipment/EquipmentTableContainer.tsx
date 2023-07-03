import * as React from 'react';
import { useState } from 'react';
import { IEquipment } from '../../models/Equipment';
import EquipmentTable from './EquipmentTable';
import SearchCustomOptions from '../Shared/SearchCustomOptions';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';
import { ISpaceShort } from '../../models/Spaces';

interface IProps {
  equipment: IEquipment[];
  equipmentAvailabilityLevels: string[];
  equipmentProtectionLevels: string[];
  equipmentTypes: string[];
  teamSpaces: ISpaceShort[];
  tags: string[];
  openRevokeModal?: (equipment: IEquipment) => void;
  openDeleteModal?: (equipment: IEquipment) => void;
  openAssignModal?: (equipment: IEquipment) => void;
  openDetailsModal?: (equipment: IEquipment) => void;
  openEditModal?: (equipment: IEquipment) => void;
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

  // filter functions
  const checkTagFilters = (equipment: IEquipment, filters: string[]) => {
    return filters.every(
      f => !!equipment && !!equipment.tags && equipment.tags.includes(f)
    );
  };
  const checkAttributeFilters = (equipment: IEquipment, filters) => {
    for (const filter of filters) {
      if (
        !equipment.attributes ||
        equipment.attributes.findIndex(
          x =>
            x.key.toLowerCase() === filter.label.toLowerCase() ||
            x.value.toLowerCase() === filter.label.toLowerCase()
        ) === -1
      ) {
        // if we cannot find an index where some of our filter matches the key
        return false;
      }
    }
    return true;
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

  return (
    <div>
      <div className='row'>
        <SearchDefinedOptions
          definedOptions={props.tags}
          selected={tagFilters}
          onSelect={setTagFilters}
          disabled={false}
          placeHolder='Search for Tags'
          id='searchTagsEquipment'
        />
        <SearchCustomOptions
          selected={attributeFilters}
          onSelect={setAttributeFilters}
          disabled={false}
          placeholder='Search for Attributes'
          id='searchAttributes'
        />
        <SearchDefinedOptions
          definedOptions={props.equipmentTypes}
          selected={equipmentTypeFilters}
          onSelect={setEquipmentTypeFilters}
          disabled={false}
          placeHolder='Search for Equipment Types'
          id='searchEquipmentTypes'
        />
        <SearchDefinedOptions
          definedOptions={props.equipmentProtectionLevels}
          selected={equipmentProtectionFilters}
          onSelect={setEquipmentProtectionFilters}
          disabled={false}
          placeHolder='Search Protection Level'
          id='equipmentProtectionLevels'
        />
        <SearchDefinedOptions
          definedOptions={props.equipmentAvailabilityLevels}
          selected={equipmentAvailabilityFilters}
          onSelect={setEquipmentAvailabilityFilters}
          disabled={false}
          placeHolder='Search Availability Level'
          id='equipmentAvailabilityLevels'
        />
        <SearchCustomOptions
          selected={managedSystemFilters}
          onSelect={setManagedSystemFilters}
          disabled={false}
          placeholder='Search for Managed System Id'
          id='searchBigfix'
        />
        <SearchCustomOptions
          selected={makeFilters}
          onSelect={setMakeFilters}
          disabled={false}
          placeholder='Search for Make'
          id='searchMake'
        />
        <SearchCustomOptions
          selected={modelFilters}
          onSelect={setModelFilters}
          disabled={false}
          placeholder='Search for Model'
          id='searchModel'
        />
      </div>
      <EquipmentTable
        equipment={filteredEquipment}
        onRevoke={props.openRevokeModal}
        onDelete={props.openDeleteModal}
        onAdd={props.openAssignModal}
        showDetails={props.openDetailsModal}
        onEdit={props.openEditModal}
      />
    </div>
  );
};

export default EquipmentTableContainer;
