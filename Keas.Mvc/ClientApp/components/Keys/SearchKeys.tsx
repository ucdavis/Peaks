﻿import * as PropTypes from 'prop-types';
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

function noopTrue() { return true; }

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
                labelKey="code"
                filterBy={noopTrue} // don't filter on top of our search
                allowNew={true}
                renderMenuItemChildren={this.renderItem}
                onSearch={this.onSearch}
                onChange={this.onChange}
                options={keys}
            />
        );
    }

    private renderItem = (option: IKey, props, index) => {
        return (
            <div>
                <div>
                    <Highlighter search={props.text}>
                        {option.name}
                    </Highlighter>
                </div>
                <div>
                    <small>
                        Code:
                        <Highlighter search={props.text}>
                            {option.code}
                        </Highlighter>
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

    private onChange = (selected: any[]) => {

        let key: IKey;

        // check for empty
        if (!selected || selected.length <= 0) {
            this.props.onDeselect();
        }
        
        // check for new selection
        if (selected[0].customOption) {
            key = {
                code: selected[0].code,
                id: 0,
                name: '',
                serials: [],
                teamId: 0,
                tags: "",
            };
        }
        else {
            key = selected[0];
        }

        this.props.onSelect(key);
        return;
    };
}
