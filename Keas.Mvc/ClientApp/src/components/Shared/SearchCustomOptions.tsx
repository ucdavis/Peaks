import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (tag: string[]) => void;
  disabled: boolean;
  selected: string[];
  placeholder: string;
  id: string;
}

// allows user to search for any text in the given field
// as opposed to from a dropdown list of options
const SearchCustomOptions = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id={props.id} // for accessibility
        options={[]}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={(selected: any[]) => {
          // if it's a "new selection" it will be an object
          // (which it always will be unless it's already selected)
          // object will look like: { customOption: true, id: 'id-1', label: 'search text'}
          const strings = selected.map(x => (x.label ? x.label : x));
          // so our parent can treat these like strings
          props.onSelect(strings);
        }}
        selected={props.selected}
        placeholder={props.placeholder}
        allowNew={true}
        emptyLabel={''}
        newSelectionPrefix='Search for: '
      />
    </div>
  );
};

export default SearchCustomOptions;
