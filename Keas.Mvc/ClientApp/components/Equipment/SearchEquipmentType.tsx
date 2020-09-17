import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (equipmentType: string[]) => void;
  disabled: boolean;
  selected: string[];
  equipmentTypes: string[];
  placeHolder: string;
}

const SearchEquipmentType = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id='searchEquipmentType' // for accessibility
        options={props.disabled ? [] : props.equipmentTypes}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={selected => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        highlightOnlyResult={true}
        placeholder={props.placeHolder}
      />
    </div>
  );
};

export default SearchEquipmentType;
