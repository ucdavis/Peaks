import * as React from 'react';
import { useState } from 'react';
import { IEquipment } from '../../models/Equipment';
import EquipmentTable from './EquipmentTable';
import SearchAllOptions from '../Shared/SearchAllOptions';
import { IFilter } from '../../models/Shared';

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
  // array of {filter: string, type: string}, where type is either a predefined type or 'any'
  // predfined types, e.g. tags, will only filter on that property of the equipment
  // state is changed inside the SearchAllOptions component
  const [allFilters, setAllFilters] = useState<IFilter[]>([]);

  const changeAllFilters = (selectedFilters: any[]) => {
    const filters = selectedFilters.map((x: any) => ({
      filter: !!x?.filter ? x.filter : x.label,
      type: !!x?.type ? x.type : 'any'
    }));
    setAllFilters(filters);
  };
  const removeFilter = (filter: IFilter) => {
    const filters = allFilters.filter(x => x.filter !== filter.filter);
    setAllFilters(filters);
  };

  // how to apply filters
  // TODO: allow searching on serial number, name, etc in this component
  const checkTagFilter = (equipment: IEquipment, filter: string) => {
    return (
      !!equipment &&
      !!equipment.tags &&
      equipment.tags.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    );
  };
  const checkAttributeFilter = (equipment: IEquipment, filter: string) => {
    // make sure the equipment has attributes, and that the filter matches
    // either the key or the value of one of the attributes
    if (
      !!equipment.attributes &&
      equipment.attributes.findIndex(
        // findIndex() will return -1 if there is not an element of the array that matches our filter
        x =>
          x.key.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
          //indexOf() will return -1 if the substring is not found
          (!!x.value && // have to check that value exists. attributes can have a key with no value
            x.value.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
      ) !== -1
    ) {
      return true;
    }
    return false;
  };
  const checkEquipmentTypeFilter = (equipment: IEquipment, filter: string) => {
    return (
      (equipment &&
        !!equipment.type &&
        equipment.type.toLowerCase().indexOf(filter.toLowerCase())) !== -1 ||
      (equipment && !equipment.type && filter === 'Default')
    );
  };
  const checkEquipmentProtectionFilter = (
    equipment: IEquipment,
    filter: string
  ) => {
    return (
      equipment &&
      !!equipment.protectionLevel &&
      equipment.protectionLevel.toLowerCase().indexOf(filter.toLowerCase()) !==
        -1
    );
  };
  const checkEquipmentAvailabilityFilter = (
    equipment: IEquipment,
    filter: string
  ) => {
    return (
      equipment &&
      !!equipment.availabilityLevel &&
      equipment.availabilityLevel
        .toLowerCase()
        .indexOf(filter.toLowerCase()) !== -1
    );
  };
  const checkManagedSystemFilter = (equipment: IEquipment, filter: string) => {
    return (
      equipment &&
      !!equipment.systemManagementId &&
      equipment.systemManagementId
        .toLowerCase()
        .indexOf(filter.toLowerCase()) !== -1
    );
  };
  const checkMakeFilter = (equipment: IEquipment, filter: string) => {
    return (
      equipment &&
      !!equipment.make &&
      equipment.make.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    );
  };
  const checkModelFilter = (equipment: IEquipment, filter: string) => {
    return (
      equipment &&
      !!equipment.model &&
      equipment.model.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    );
  };
  const checkTeamSpacesFilter = (equipment: IEquipment, filter: string) => {
    return (
      equipment &&
      !!equipment.space &&
      // matches exactly from our list of options
      // TODO: allow for partial matches, e.g. search for all equipment in a building
      filter
        .toLowerCase()
        .includes(
          `${equipment.space.roomNumber} ${equipment.space.bldgName}`.toLowerCase()
        )
    );
  };

  const checkAllFilters = (equipment: IEquipment) => {
    const filters = allFilters;

    return filters.every(
      f =>
        !!equipment &&
        ((f.type === 'tag' && checkTagFilter(equipment, f.filter)) ||
          (f.type === 'equipmentType' &&
            checkEquipmentTypeFilter(equipment, f.filter)) ||
          (f.type === 'equipmentProtectionLevel' &&
            checkEquipmentProtectionFilter(equipment, f.filter)) ||
          (f.type === 'equipmentAvailabilityLevel' &&
            checkEquipmentAvailabilityFilter(equipment, f.filter)) ||
          (f.type === 'teamSpace' &&
            checkTeamSpacesFilter(equipment, f.filter)) ||
          (f.type === 'any' &&
            (checkTagFilter(equipment, f.filter) ||
              checkEquipmentTypeFilter(equipment, f.filter) ||
              checkEquipmentProtectionFilter(equipment, f.filter) ||
              checkEquipmentAvailabilityFilter(equipment, f.filter) ||
              checkTeamSpacesFilter(equipment, f.filter) ||
              checkAttributeFilter(equipment, f.filter) ||
              checkMakeFilter(equipment, f.filter) ||
              checkModelFilter(equipment, f.filter) ||
              checkManagedSystemFilter(equipment, f.filter))))
    );
  };

  const allOptions: IFilter[] = [
    // add all predefined options here
    ...props.tags.map(x => ({ filter: x, type: 'tag' })),
    ...props.equipmentTypes.map(x => ({ filter: x, type: 'equipmentType' })),
    ...props.equipmentProtectionLevels.map(x => ({
      filter: x,
      type: 'equipmentProtectionLevel'
    })),
    ...props.equipmentAvailabilityLevels.map(x => ({
      filter: x,
      type: 'equipmentAvailabilityLevel'
    })),
    ...props.teamSpaces.map(x => ({ filter: x, type: 'teamSpace' }))
  ];

  let filteredAllEquipment = props.equipment;
  if (allFilters.length > 0) {
    filteredAllEquipment = filteredAllEquipment.filter(x => checkAllFilters(x));
  }

  return (
    <div>
      <div className='row'>
        <SearchAllOptions
          selected={allFilters}
          definedOptions={allOptions}
          onSelect={changeAllFilters}
          onRemove={removeFilter}
          disabled={false}
          placeholder='Search for All'
          id='searchAll'
        />
      </div>
      <EquipmentTable
        equipment={filteredAllEquipment}
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
