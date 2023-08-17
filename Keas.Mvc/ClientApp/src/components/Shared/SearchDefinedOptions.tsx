import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (definedOptions: string[]) => void;
  disabled: boolean;
  selected: string[];
  definedOptions: string[];
  placeholder: string;
  id: string;
  inputProps?: any;
}

// user searches and picks from a list of pre-defined options
// these are either hardcoded or fetched per team
const SearchDefinedOptions = (props: IProps) => {
  let ref;
  return (
    <div>
      <Typeahead
        id={props.id} // for accessibility
        options={props.disabled ? [] : props.definedOptions}
        disabled={props.disabled}
        allowNew={false}
        multiple={true}
        clearButton={true}
        onChange={(selected: string[]) => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        highlightOnlyResult={true}
        placeholder={props.placeholder}
        inputProps={props.inputProps}
        onBlur={() => {
          // there is a bug when using a typeahead inside a modal
          // that this fixes. see https://github.com/ucdavis/Peaks/issues/1273
          // but ideally we do not use refs
          ref.hideMenu();
        }}
        ref={el => (ref = el)}
      />
    </div>
  );
};

export default SearchDefinedOptions;
