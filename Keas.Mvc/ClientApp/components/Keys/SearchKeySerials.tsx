import * as PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { AppContext, IKey, IKeySerial } from "../../Types";

interface IProps {
    allowNew: boolean;
    selectedKey?: IKey;
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
            <AsyncTypeahead
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
        );
    };

    private renderItem = (option: IKeySerial, props, index) => {
        return (
            <div>
                <div>
                    <Highlighter search={props.text}>{option.key.name}</Highlighter>
                    <span> - </span>
                    <Highlighter search={props.text}>{option.key.code}</Highlighter>
                </div>
                <div>
                    <small>
                        <span>Serial Number: </span>
                        <Highlighter search={props.text}>{option.number}</Highlighter>
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
        } else {
            keySerial = selected[0];
        }

        this.props.onSelect(keySerial);
        return;
    };
}
