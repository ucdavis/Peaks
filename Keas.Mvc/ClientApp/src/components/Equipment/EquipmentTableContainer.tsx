import * as React from 'react';
import { useState } from 'react';
import { IEquipment } from '../../models/Equipment';
import SearchTags from '../Tags/SearchTags';
import EquipmentTable from './EquipmentTable';
import TypeaheadSearchCustomOptions from '../Shared/TypeaheadSearchCustomOptions';
import SearchManagedSystem from './SearchManagedSystem';
import TypeaheadSearchDefinedOptions from '../Shared/TypeaheadSearchDefinedOptions';

interface IProps {
  equipment: IEquipment[];
  equipmentAvailabilityLevels: string[];
  equipmentProtectionLevels: string[];
  equipmentTypes: string[];
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
  const [attributeFilters, setAttributeFilters] = useState<object[]>([]);
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
  const [makeFilters, setMakeFilters] = useState<object[]>([]);
  const [modelFilters, setModelFilters] = useState<object[]>([]);

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
  const checkMakeFilters = (equipment: IEquipment, filters) => {
    return filters.some(
      f =>
        equipment &&
        !!equipment.make &&
        equipment.make.toLowerCase().includes(f.label.toLowerCase())
    );
  };
  const checkModelFilters = (equipment: IEquipment, filters) => {
    return filters.some(
      f =>
        equipment &&
        !!equipment.model &&
        equipment.model.toLowerCase().includes(f.label.toLowerCase())
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
    filteredEquipment = filteredEquipment.filter(x =>
      checkMakeFilters(x, makeFilters)
    );
  }
  if (modelFilters.length > 0) {
    filteredEquipment = filteredEquipment.filter(x =>
      checkModelFilters(x, modelFilters)
    );
  }

  return (
    <div>
      <div className='row'>
        <TypeaheadSearchDefinedOptions
          definedOptions={props.tags}
          selected={tagFilters}
          onSelect={setTagFilters}
          disabled={false}
          placeHolder='Search for Tags'
          id='searchTags'
        />
        <TypeaheadSearchCustomOptions
          selected={attributeFilters}
          onSelect={setAttributeFilters}
          disabled={false}
          id='searchAttributes'
          placeholder='Search for Attributes'
        />
        <TypeaheadSearchDefinedOptions
          definedOptions={props.equipmentTypes}
          selected={equipmentTypeFilters}
          onSelect={setEquipmentTypeFilters}
          disabled={false}
          placeHolder='Search for Equipment Types'
          id='searchEquipmentTypes'
        />
        <TypeaheadSearchDefinedOptions
          definedOptions={props.equipmentProtectionLevels}
          selected={equipmentProtectionFilters}
          onSelect={setEquipmentProtectionFilters}
          disabled={false}
          placeHolder='Search Protection Level'
          id='equipmentProtectionLevels'
        />
        <TypeaheadSearchDefinedOptions
          definedOptions={props.equipmentAvailabilityLevels}
          selected={equipmentAvailabilityFilters}
          onSelect={setEquipmentAvailabilityFilters}
          disabled={false}
          placeHolder='Search Availability Level'
          id='equipmentAvailabilityLevels'
        />
        <SearchManagedSystem
          selected={managedSystemFilters}
          onSelect={setManagedSystemFilters}
          disabled={false}
        />
        <TypeaheadSearchCustomOptions
          selected={makeFilters}
          onSelect={setMakeFilters}
          disabled={false}
          id='searchMake'
          placeholder='Search for Make'
        />
        <TypeaheadSearchCustomOptions
          selected={modelFilters}
          onSelect={setModelFilters}
          disabled={false}
          id='searchModel'
          placeholder='Search for Model'
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
