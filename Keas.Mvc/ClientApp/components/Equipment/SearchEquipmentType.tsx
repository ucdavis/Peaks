import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
  onSelect: (equipmentType: string[]) => void;
  disabled: boolean;
  selected: string[];
  equipmentTypes: string[];
  placeHolder: string;
}

export default class SearchEquipmentType extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        <Typeahead
          id='searchEquipmentType' // for accessibility
          options={this.props.disabled ? [] : this.props.equipmentTypes}
          disabled={this.props.disabled}
          multiple={true}
          clearButton={true}
          onChange={selected => {
            this.props.onSelect(selected);
          }}
          selected={this.props.selected}
          highlightOnlyResult={true}
          selectHintOnEnter={true}
          placeholder={this.props.placeHolder}
        />
      </div>
    );
  }
}
