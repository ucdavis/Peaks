import PropTypes from "prop-types";
import * as React from "react";
import { Highlighter, Typeahead } from "react-bootstrap-typeahead";
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
    onSelect?: (tag: string[]) => void;
    disabled: boolean;
    defaultValues?: string[];
    tags: string[];
}

export default class SearchTags extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                <Typeahead
                    options={this.props.disabled ? [] : this.props.tags}
                    disabled={this.props.disabled}
                    multiple={true}
                    clearButton={true}
                    onChange={selected => {
                        this.props.onSelect(selected);
                    }}
                    selected={this.props.defaultValues}
                    highlightOnlyResult={true}
                    selectHintOnEnter={true}
                    placeholder="Search for tags"
                />
            </div>
        );
    }
}
