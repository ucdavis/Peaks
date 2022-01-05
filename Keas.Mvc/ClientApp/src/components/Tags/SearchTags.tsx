import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (tag: string[]) => void;
  disabled: boolean;
  selected: string[];
  tags: string[];
}

const SearchTags = (props: IProps) => {
  return (
    <div>
      <Typeahead
        id='searchTags' // for accessibility
        options={props.disabled ? [] : props.tags}
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={selected => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        highlightOnlyResult={true}
        placeholder='Search for Tags'
      />
    </div>
  );
};

export default SearchTags;
