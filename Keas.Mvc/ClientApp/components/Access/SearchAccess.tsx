import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { AppContext, IAccess } from "../../Types";

interface IProps {
    allowNew: boolean;
    selectedAccess?: IAccess;
    onSelect: (access: IAccess) => void;
    onDeselect: () => void;
}

interface IState {
    isSearchLoading: boolean;
    access: IAccess[];
}

// Search for existing access then send selection back to parent
export default class SearchAccess extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            access: [],
            isSearchLoading: false,
        };
    }

    public render() {
        if (this.props.selectedAccess != null) {
            return this._renderExistingAccess();
        }
        else {
            return this._renderSelectAccess();
        }
    }

    private _onSelected = (access: IAccess) => {
        // onChange is called when deselected
        if (access == null || access.name == null) {
            this.props.onDeselect();
        }
        else {
            // if teamId is not set, this is a new access
            this.props.onSelect({
                assignments: access.teamId ? access.assignments : [],
                id: access.teamId ? access.id : 0,
                name: access.name,
                teamId: access.teamId ? access.teamId : 0,
            });
        }
    };

    private _renderSelectAccess = () => {

        return (
            <div>
                <AsyncTypeahead
                    isLoading={this.state.isSearchLoading}
                    minLength={3}
                    placeholder="Search for access by name or by serial number"
                    labelKey="name"
                    filterBy={() => true} // don't filter on top of our search
                    allowNew={this.props.allowNew}
                    renderMenuItemChildren={(option, props, index) => (
                        <div>
                            <div>
                                <Highlighter key="name" search={props.text}>
                                    {option.name}
                                </Highlighter>
                            </div>
                            <div>
                                <small>
                                    Some other search term:
                                    <Highlighter key="id" search={props.text}>text</Highlighter>
                                </small>
                            </div>
                        </div>
                    )}
                    onSearch={async query => {
                        this.setState({ isSearchLoading: true });
                        const access = await this.context.fetch(
                            `/api/${this.context.team.name}/access/search?teamId=${this.context.team.id}&q=${query}`
                        );
                        this.setState({
                            access,
                            isSearchLoading: false,
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this._onSelected(selected[0]);
                        }
                    }}
                    options={this.state.access}
                />
            </div>
        );
    }

    private _renderExistingAccess = () => {
        return (
            <input
                type="text"
                className="form-control"
                value={this.props.selectedAccess.name}
                disabled={true}
            />
        );
    };
}
