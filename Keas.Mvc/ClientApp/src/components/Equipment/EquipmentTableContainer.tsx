import * as React from 'react';
import { useState } from 'react';
import { IEquipment } from '../../models/Equipment';
import EquipmentTable from './EquipmentTable';
import SearchCustomOptions from '../Shared/SearchCustomOptions';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';
import SearchAllOptions from '../Shared/SearchAllOptions';

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

  // filter functions
  const checkTagFilters = (equipment: IEquipment, filters: string[]) => {
    return filters.every(
      f =>
        !!equipment &&
        !!equipment.tags &&
        equipment.tags.toLowerCase().indexOf(f.toLowerCase()) !== -1
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
    return filters.every(
      f =>
        (equipment &&
          !!equipment.type &&
          equipment.type.toLowerCase().indexOf(f.toLowerCase())) !== -1 ||
        (equipment && !equipment.type && f === 'Default')
    );
  };
  const checkEquipmentProtectionFilters = (equipment: IEquipment) => {
    const filters = equipmentProtectionFilters;
    return filters.every(
      f =>
        equipment &&
        !!equipment.protectionLevel &&
        equipment.protectionLevel.toLowerCase().indexOf(f.toLowerCase()) !== -1
    );
  };
  const checkEquipmentAvailabilityFilters = (equipment: IEquipment) => {
    const filters = equipmentAvailabilityFilters;
    return filters.every(
      f =>
        equipment &&
        !!equipment.availabilityLevel &&
        equipment.availabilityLevel.toLowerCase().indexOf(f.toLowerCase()) !==
          -1
    );
  };
  const checkManagedSystemFilters = (equipment: IEquipment) => {
    const filters = managedSystemFilters;
    return filters.every(
      f =>
        equipment &&
        !!equipment.systemManagementId &&
        equipment.systemManagementId.toLowerCase().indexOf(f) !== -1
    );
  };
  const checkMakeFilters = (equipment: IEquipment) => {
    const filters = makeFilters;
    return filters.every(
      f =>
        equipment &&
        !!equipment.make &&
        equipment.make.toLowerCase().indexOf(f.toLowerCase()) !== -1
    );
  };
  const checkModelFilters = (equipment: IEquipment) => {
    const filters = modelFilters;
    return filters.every(
      f =>
        equipment &&
        !!equipment.model &&
        equipment.model.toLowerCase().indexOf(f.toLowerCase()) !== -1
    );
  };
  const checkTeamSpacesFilters = (equipment: IEquipment) => {
    const filters = teamSpacesFilters;
    return filters.every(
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
      <div className='row'>
        <SearchAllOptions
          selected={tagFilters}
          definedOptions={props.tags}
          onSelect={setTagFilters}
          disabled={false}
          placeholder='Search for Tags'
          id='searchTags'
        />
        <SearchDefinedOptions
          definedOptions={props.tags}
          selected={tagFilters}
          onSelect={setTagFilters}
          disabled={false}
          placeholder='Search for Tags'
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
          placeholder='Search for Equipment Types'
          id='searchEquipmentTypes'
        />
        <SearchDefinedOptions
          definedOptions={props.equipmentProtectionLevels}
          selected={equipmentProtectionFilters}
          onSelect={setEquipmentProtectionFilters}
          disabled={false}
          placeholder='Search Protection Level'
          id='equipmentProtectionLevels'
        />
        <SearchDefinedOptions
          definedOptions={props.equipmentAvailabilityLevels}
          selected={equipmentAvailabilityFilters}
          onSelect={setEquipmentAvailabilityFilters}
          disabled={false}
          placeholder='Search Availability Level'
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
        <SearchDefinedOptions
          definedOptions={props.teamSpaces}
          selected={teamSpacesFilters}
          onSelect={setTeamSpacesFilters}
          disabled={false}
          placeholder='Search for Team Spaces'
          id='searchTeamSpaces'
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
