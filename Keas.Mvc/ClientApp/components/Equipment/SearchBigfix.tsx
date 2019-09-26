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
                        // if it's a "new selection" it will be an object
                        // (which it always will be unless it's already selected)
                        const strings = selected.map(x => (x.label ? x.label : x));
                        // so our parent can treat these like strings
                        this.props.onSelect(strings);
                    }}
                    selected={this.props.selected}
                    selectHintOnEnter={true}
                    placeholder="Search Bigfix Id"
                    allowNew={true}
                    emptyLabel={""}
                    newSelectionPrefix="Search for: "
                />
            </div>
        );
    }
}
