import PropTypes from "prop-types";
import * as React from "react";
import { Highlighter, Typeahead } from "react-bootstrap-typeahead";
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface IProps {
    onSelect?: (tag: string[]) => void;
    tags: string[];
}

export default class SearchTags extends React.Component<IProps, {}> {

    public render() {
        return (
            <div>
                <Typeahead
                    options={this.props.tags}
                    multiple={true}
                    clearButton={true}
                    onChange={selected => {
                        this.props.onSelect(selected);
                    }}
                    placeholder="Search for tags"
                />
            </div>
        );
    }
}
