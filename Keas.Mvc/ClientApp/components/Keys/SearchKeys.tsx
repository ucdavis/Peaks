import * as PropTypes from 'prop-types';
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { AppContext, IKeyInfo } from "../../Types";

interface IProps {
    defaultKeyInfo?: IKeyInfo;
    onSelect: (keyInfo: IKeyInfo) => void;
    onDeselect: () => void;
}

interface IState {
    isSearchLoading: boolean;
    keysInfo: IKeyInfo[];
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
            keysInfo: [],
        };
    }

    public render() {
        const { defaultKeyInfo } = this.props;
        const { isSearchLoading, keysInfo } = this.state;

        return (
            <AsyncTypeahead
                defaultSelected={defaultKeyInfo ? [defaultKeyInfo] : []}
                isLoading={isSearchLoading}
                minLength={2}
                placeholder="Search for key by name or by serial number"
                labelKey="code"
                filterBy={noopTrue} // don't filter on top of our search
                allowNew={true}
                renderMenuItemChildren={this.renderItem}
                onSearch={this.onSearch}
                onChange={this.onChange}
                options={keysInfo}
            />
        );
    }

    private renderItem = (option: IKeyInfo, props, index) => {
        return (
            <div>
                <div>
                    <Highlighter search={props.text}>
                        {option.key.name}
                    </Highlighter>
                </div>
                <div>
                    <small>
                        Code:
                        <Highlighter search={props.text}>
                            {option.key.code}
                        </Highlighter>
                    </small>
                </div>
            </div>
        );
    }

    private onSearch = async query => {
        const { team } = this.context;

        this.setState({ isSearchLoading: true });

        const keysInfo = await this.context.fetch(`/api/${team.slug}/keys/search?q=${query}`);

        this.setState({
            isSearchLoading: false,
            keysInfo
        });
    }

    private onChange = (selected: any[]) => {

        let keyInfo: IKeyInfo;

        // check for empty
        if (!selected || selected.length <= 0) {
            this.props.onDeselect();
        }
        
        // check for new selection
        if (selected[0].customOption) {
            keyInfo = {
                id: 0,
                key: {
                    code: selected[0].code,
                    id: 0,
                    name: '',
                    serials: [],
                    tags: "",
                    teamId: 0,
                },
                serialsInUseCount: 0,
                serialsTotalCount: 0,
                spacesCount: 0
            };
        }
        else {
            keyInfo = selected[0];
        }

        this.props.onSelect(keyInfo);
        return;
    };
}
