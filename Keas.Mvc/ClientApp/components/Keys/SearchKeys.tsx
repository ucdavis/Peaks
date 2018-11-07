import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { IKey, AppContext } from "../../Types";

interface IProps {
    defaultKey?: IKey;
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
        const { defaultKey } = this.props;
        const { isSearchLoading, keys } = this.state;

        return (
            <AsyncTypeahead
                defaultSelected={defaultKey ? [defaultKey] : []}
                isLoading={isSearchLoading}
                minLength={2}
                placeholder="Search for key by name or by serial number"
                labelKey="name"
                filterBy={() => true} // don't filter on top of our search
                allowNew={true}
                renderMenuItemChildren={this.renderItem}
                onSearch={this.onSearch}
                onChange={this.onChange}
                options={keys}
            />
        );
    }

    private renderItem = (option, props, index) => {
        return (
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
        );
    }

    private onSearch = async query => {
        const { team } = this.context;

        this.setState({ isSearchLoading: true });

        const keys = await this.context.fetch(`/api/${team.slug}/keys/search?q=${query}`);

        this.setState({
            isSearchLoading: false,
            keys
        });
    }

    private onChange = (selected: IKey[]) => {
        if (selected && selected.length === 1) {
            this.props.onSelect(selected[0]);
            return;
        }

        this.props.onDeselect();
    };
}
