import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { IKeySerial, AppContext } from "../../Types";

interface IProps {
    selectedKeySerial?: IKeySerial;
    onSelect: (keySerial: IKeySerial) => void;
    onDeselect: () => void;
}

interface IState {
    isSearchLoading: boolean;
    keySerials: IKeySerial[];
}

// Search for existing key then send selection back to parent
export default class SearchKeySerials extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props: IProps) {
        super(props);

        this.state = {
            isSearchLoading: false,
            keySerials: [],
        };
    }

    public render() {
        if (this.props.selectedKeySerial != null) {
            return this._renderExistingKey();
        }

        return this._renderSelectKey();
    }

    private _renderExistingKey = () => {
        return (
            <input
                type="text"
                className="form-control"
                value={this.props.selectedKeySerial.number}
                disabled={true}
            />
        );
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
                        const results = await this.context.fetch(
                            `/api/${this.context.team.slug}/keySerials/search?q=${query}`
                        );
                        this.setState({
                            isSearchLoading: false,
                            keySerials: results,
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this._onSelected(selected[0]);
                        }
                    }}
                    options={this.state.keySerials}
                />
            </div>
        );
    }

    private _onSelected = (keySerial: IKeySerial) => {
        // onChange is called when deselected
        if (keySerial == null || keySerial.number == null) {
            this.props.onDeselect();
            return;
        }

        this.props.onSelect(keySerial);
    };
}
