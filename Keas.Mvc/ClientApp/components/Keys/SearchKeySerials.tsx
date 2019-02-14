import * as PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { Button } from "reactstrap";
import { AppContext, IKey, IKeySerial } from "../../Types";

interface IProps {
    allowNew: boolean;
    selectedKey?: IKey;
    selectedKeySerial?: IKeySerial;
    onSelect: (keySerial: IKeySerial) => void;
    onDeselect: () => void;
    openDetailsModal: (keySerial: IKeySerial) => void;
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
            keySerials: []
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
    };

    private _renderSelectKey = () => {
        const { isSearchLoading, keySerials } = this.state;
        return (
            <div>
                <label>Pick an equipment to assign</label>
                <div>
                    <AsyncTypeahead
                        isInvalid={!this.props.selectedKey || !this.props.selectedKeySerial}
                        isLoading={isSearchLoading}
                        minLength={1}
                        placeholder="Search for key by name or by serial number"
                        labelKey="number"
                        filterBy={() => true} // don't filter on top of our search
                        allowNew={this.props.allowNew}
                        renderMenuItemChildren={this.renderItem}
                        onSearch={this.onSearch}
                        onChange={this.onChange}
                        options={keySerials}
                    />
                </div>
                <div>or</div>
                <div>
                    <Button color="link" onClick={this._createNew}>
                        <i className="fas fa-plus fa-sm" aria-hidden="true" /> Create New Serial
                    </Button>
                </div>
            </div>
        );
    };

    private renderItem = (option: IKeySerial, props, index) => {
        return (
            <div className={!!option.keySerialAssignment ? "disabled" : ""}>
                <div>
                    <div>
                        <Highlighter search={props.text}>{option.key.name}</Highlighter>
                        <span> - </span>
                        <Highlighter search={props.text}>{option.key.code}</Highlighter>
                    </div>
                </div>
                <div>{!!option.keySerialAssignment ? "Assigned" : "Unassigned"}</div>
                <div>
                    <small>
                        Serial Number:
                        <Highlighter key="number" search={props.text}>
                            {option.number}
                        </Highlighter>
                    </small>
                </div>
            </div>
        );
    };

    private onSearch = async query => {
        const { team } = this.context;

        this.setState({ isSearchLoading: true });

        const results = await this.context.fetch(`/api/${team.slug}/keySerials/search?q=${query}`);

        this.setState({
            isSearchLoading: false,
            keySerials: results
        });
    };

    private onChange = (selected: any[]) => {
        let keySerial: IKeySerial;

        // check for empty
        if (!selected || selected.length <= 0) {
            this.props.onDeselect();
        }

        // check for new selection
        if (selected[0].customOption) {
            keySerial = {
                id: 0,
                key: this.props.selectedKey,
                number: selected[0].number,
                status: "Active",
                tags: ""
            };
            this.props.onSelect(keySerial);
        } else if (!!selected[0].keySerialAssignment) {
            this.props.openDetailsModal(selected[0]);
        } else {
            keySerial = selected[0];
            this.props.onSelect(keySerial);
        }

        return;
    };

    private _createNew = () => {
        const keySerial = {
            id: 0,
            key: this.props.selectedKey,
            number: "",
            status: "Active",
            tags: ""
        };
        this.props.onSelect(keySerial);
    };
}
