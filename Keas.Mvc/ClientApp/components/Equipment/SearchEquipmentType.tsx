import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

interface IProps {
    onSelect: (equipmentType: string[]) => void;
    disabled: boolean;
    selected: string[];
    equipmentTypes: string[];
}

export default class SearchEquipmentType extends React.Component<IProps, {}> {
    public render() {
        return (
            <div>
                <Typeahead
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
                    placeholder="Search for Equipment Types"
                />
            </div>
        );
    }
}