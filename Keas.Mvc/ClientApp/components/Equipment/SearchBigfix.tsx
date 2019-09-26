import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

interface IProps {
    onSelect: (value: string[]) => void;
    disabled: boolean;
    selected: string[];
}

export default class SearchBigfix extends React.Component<IProps, {}> {
    public render() {
        return (
            <div>
                <Typeahead
                    id="searchBigfix" // for accessibility
                    options={[]}
                    multiple={true}
                    disabled={this.props.disabled}
                    clearButton={true}
                    onChange={(selected: any[]) => {
                        const strings = selected.map(x => x.label);
                        this.props.onSelect(strings);
                    }}
                    selected={this.props.selected}
                    selectHintOnEnter={true}
                    placeholder="Search bigfix id"
                    allowNew={true}
                    emptyLabel={""}
                    newSelectionPrefix="Search for: "
                />
            </div>
        );
    }
}
