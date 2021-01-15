import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (value: string[]) => void;
  disabled: boolean;
  selected: string[];
}

const SearchManagedSystem = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id='searchBigfix' // for accessibility
        options={[]}
        multiple={true}
        disabled={props.disabled}
        clearButton={true}
        onChange={(selected: any[]) => {
          // if it's a "new selection" it will be an object
          // (which it always will be unless it's already selected)
          const strings = selected.map(x => (x.label ? x.label : x));
          // so our parent can treat these like strings
          props.onSelect(strings);
        }}
        selected={props.selected}
        placeholder='Search for Bigfix Id'
        allowNew={true}
        emptyLabel={''}
        newSelectionPrefix='Search for: '
      />
    </div>
  );
};

export default SearchManagedSystem;
