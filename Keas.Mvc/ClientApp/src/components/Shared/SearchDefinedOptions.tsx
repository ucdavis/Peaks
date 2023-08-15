import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (definedOptions: string[]) => void;
  disabled: boolean;
  selected: string[];
  definedOptions: string[];
  placeHolder: string;
  id: string;
}

// user searches and picks from a list of pre-defined options
// these are either hardcoded or fetched per team
const SearchDefinedOptions = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id={props.id} // for accessibility
        options={props.disabled ? [] : props.definedOptions}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={(selected: string[]) => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        highlightOnlyResult={true}
        placeholder={props.placeholder}
      />
    </div>
  );
};

export default SearchDefinedOptions;
