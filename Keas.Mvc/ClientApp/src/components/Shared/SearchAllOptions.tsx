import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { IFilter } from '../../models/Shared';

interface IProps {
  onSelect: (definedOptions: IFilter[]) => void;
  disabled: boolean;
  selected: IFilter[];
  definedOptions: IFilter[];
  placeholder: string;
  id: string;
}

// user searches and picks from a list of pre-defined options
// these are either hardcoded or fetched per team
const SearchAllOptions = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id={props.id} // for accessibility
        options={props.disabled ? [] : props.definedOptions}
        labelKey={(option: IFilter) => option.filter}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={selected => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        highlightOnlyResult={true}
        placeholder={props.placeholder}
      />
    </div>
  );
};

export default SearchAllOptions;
