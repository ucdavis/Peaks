import PropTypes from "prop-types";
import * as React from "react";

import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { AppContext, ISpace } from "../../Types";

interface IProps {
   onSelect: (space: ISpace) => void;
    defaultSpace?: ISpace;
}

interface IState {
    isSearchLoading: boolean;
    spaces: ISpace[];
    selectedSpace: ISpace;
}

// TODO: need a way to clear out selected person
// Assign a person via search lookup, unless a person is already provided
export default class AssignSpace extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            isSearchLoading: false,
            spaces: [],
            selectedSpace: null,
        };
    }

    public render() {
        return (
            <div>
                <AsyncTypeahead
                    clearButton={true}
                    isLoading={this.state.isSearchLoading}
                    minLength={2}
                    placeholder="Search for space"
                    defaultSelected={this.props.defaultSpace ? [this.props.defaultSpace] : []}
                    labelKey={(option: ISpace) =>
                        `${option.roomNumber} ${option.bldgName}`
                    }
                    filterBy={() => true} 
                    renderMenuItemChildren={(option, props, index) => (
                        <div>
                            <div>
                                {!!option.roomNumber &&
                                    <Highlighter key="roomNumber" search={props.text}>
                                        {option.roomNumber}
                                    </Highlighter>}
                                {" "}
                                {!!option.bldgName &&
                                    <Highlighter key="bldgName" search={props.text}>
                                        {option.bldgName}
                                    </Highlighter>}
                            </div>
                            {!!option.roomName &&
                                <div>
                                    <small>
                                        <Highlighter key="roomName" search={props.text}>{option.roomName}</Highlighter>
                                    </small>
                                </div>}
                        </div>
                    )}
                    onSearch={async query => {
                        this.setState({ isSearchLoading: true });
                        const spaces = await this.context.fetch(
                            `/api/${this.context.team.slug}/spaces/searchSpaces?q=${query}`
                        );
                        this.setState({
                            isSearchLoading: false,
                            spaces
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this.setState({ selectedSpace: selected[0] });
                            this.props.onSelect(selected[0]);
                        }
                        else
                        {
                            this.setState({selectedSpace: null});
                            this.props.onSelect(null);
                        }
                    }}
                    options={this.state.spaces}
                />
            </div>
        );
    };

}
