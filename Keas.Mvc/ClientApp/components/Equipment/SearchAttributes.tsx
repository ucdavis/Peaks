import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (tag: string[]) => void;
  disabled: boolean;
  selected: string[];
}

export default class SearchAttributes extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        <Typeahead
          id='searchAttributes' // for accessibility
          options={[]}
          disabled={this.props.disabled}
          multiple={true}
          clearButton={true}
          onChange={selected => {
            this.props.onSelect(selected);
          }}
          selected={this.props.selected}
          selectHintOnEnter={true}
          placeholder='Search attributes'
          allowNew={true}
          emptyLabel={''}
          newSelectionPrefix='Search for: '
        />
      </div>
    );
  }
}
