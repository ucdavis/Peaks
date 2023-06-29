import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (tag: object[]) => void;
  disabled: boolean;
  selected: object[];
  placeholder: string;
  id: string;
}

// allows user to search for any text in the given field
// as opposed to from a dropdown list of options
const SearchFilterCustomOption = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id={props.id} // for accessibility
        options={[]}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={selected => {
          props.onSelect(selected);
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

export default SearchFilterCustomOption;
