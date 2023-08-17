import * as React from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  id: string;
  isLoading: boolean;
  minLength: number;
  placeholder: string;
  labelKey: string;
  allowNew: boolean;
  renderMenuItemChildren: (
    option: any,
    props: any,
    index: number
  ) => JSX.Element;
  onSearch: (query: string) => void;
  onChange: (selected: any[]) => void;
  options: any[];
  defaultSelected?: any[];
}

// async typeahead with defined options pulled from the server
const SearchAsyncOptions = (props: IProps) => {
  let ref;
  return (
    <AsyncTypeahead
      id={props.id} // for accessibility
      isLoading={props.isLoading}
      minLength={props.minLength}
      placeholder={props.placeholder}
      labelKey={props.labelKey}
      allowNew={props.allowNew}
      filterBy={() => true} // don't filter on top of our search
      renderMenuItemChildren={props.renderMenuItemChildren}
      onSearch={props.onSearch}
      onChange={(selected: any[]) => {
        props.onChange(selected);
      }}
      options={props.options}
      defaultSelected={props.defaultSelected ? props.defaultSelected : []}
      onBlur={() => {
        ref.hideMenu();
      }}
      ref={el => (ref = el)}
    />
  );
};

export default SearchAsyncOptions;
