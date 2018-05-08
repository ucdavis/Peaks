import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { IKey, AppContext } from "../../Types";

interface IProps {
    selectedKey?: IKey;
    onSelect: (key: IKey) => void;
    onDeselect: () => void;
}

interface IState {
    isSearchLoading: boolean;
    keys: IKey[];
}

// Search for existing key then send selection back to parent
export default class SearchKeys extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            isSearchLoading: false,
            keys: [],
        };
    }

    public render() {
        if (this.props.selectedKey != null) {
            return this._renderExistingKey();
        }
        else {
            return this._renderSelectKey();
        }
    }

    private _renderSelectKey = () => {

        return (
            <div>
                <AsyncTypeahead
                    isLoading={this.state.isSearchLoading}
                    minLength={3}
                    placeholder="Search for key by name or by serial number"
                    labelKey="name"
                    filterBy={() => true} // don't filter on top of our search
                    allowNew={true}
                    renderMenuItemChildren={(option, props, index) => (
                        <div>
                            <div>
                                <Highlighter key="name" search={props.text}>
                                    {option.name}
                                </Highlighter>
                            </div>
                            <div>
                                <small>
                                    Serial Number:
                                    <Highlighter key="serialNumber" search={props.text}>{option.serialNumber}</Highlighter>
                                </small>
                            </div>
                        </div>
                    )}
                    onSearch={async query => {
                        this.setState({ isSearchLoading: true });
                        const keys = await this.context.fetch(
                            `/api/${this.context.team.name}/keys/search?q=${query}`
                        );
                        this.setState({
                            isSearchLoading: false,
                            keys
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this._onSelected(selected[0]);
                        }
                    }}
                    options={this.state.keys}
                />
            </div>
        );
    }

    private _renderExistingKey = () => {
        return (
            <input
                type="text"
                className="form-control"
                value={this.props.selectedKey.name}
                disabled={true}
            />
        );
    };

    private _onSelected = (key: IKey) => {
        // onChange is called when deselected
        if (key == null || key.name == null) {
            this.props.onDeselect();
        }
        else {
            // if teamId is not set, this is a new key
            this.props.onSelect({
                id: key.teamId ? key.id : 0,
                name: key.name,
                serialNumber: key.serialNumber ? key.serialNumber : "",
                teamId: key.teamId ? key.teamId : 0,
            });
        }
    };
}
