import * as React from 'react';
import { Highlighter, Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { IFilter } from '../../models/Shared';

interface IProps {
  // if it's a "new selection" it will be an object
  // object will look like: { customOption: true, id: 'id-1', label: 'search text'}
  // handled in the onSelect prop to give us IFilter[]
  onSelect: (filters: any[]) => void;
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
        options={props.definedOptions}
        labelKey='filter'
        disabled={props.disabled}
        multiple={true}
        clearButton={true}
        onChange={selected => {
          props.onSelect(selected);
        }}
        selected={props.selected}
        placeholder={props.placeholder}
        allowNew={true}
        renderMenuItemChildren={(option: IFilter, { text }) => (
          <>
            <Highlighter search={text}>{option.filter}</Highlighter>
            <div>
              <small>{option.type}</small>
            </div>
          </>
        )}
      />
    </div>
  );
};

export default SearchAllOptions;
