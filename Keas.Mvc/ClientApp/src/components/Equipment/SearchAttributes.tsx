import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (tag: object[]) => void;
  disabled: boolean;
  selected: object[];
}

const SearchAttributes = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id='searchAttributes' // for accessibility
        options={[]}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={selected => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        placeholder='Search for Attributes'
        allowNew={true}
        emptyLabel={''}
        newSelectionPrefix='Search for: '
      />
    </div>
  );
};

export default SearchAttributes;
