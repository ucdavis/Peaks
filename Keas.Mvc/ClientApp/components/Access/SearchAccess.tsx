import * as PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { Button } from "reactstrap";
import { AppContext, IAccess } from "../../Types";

interface IProps {
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
            isSearchLoading: false
        };
    }

    public render() {
        return this._renderSelectAccess();
    }

    private _renderSelectAccess = () => {
        return (
            <div>
                <label>Pick an access to assign</label>
                <div>
                    <AsyncTypeahead
                        isLoading={this.state.isSearchLoading}
                        minLength={3}
                        placeholder="Search for access by name or by serial number"
                        labelKey="name"
                        filterBy={() => true} // don't filter on top of our search
                        allowNew={false}
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
                                        <Highlighter key="id" search={props.text}>
                                            text
                                        </Highlighter>
                                    </small>
                                </div>
                            </div>
                        )}
                        onSearch={async query => {
                            this.setState({ isSearchLoading: true });
                            const access = await this.context.fetch(
                                `/api/${this.context.team.slug}/access/search?q=${query}`
                            );
                            this.setState({
                                access,
                                isSearchLoading: false
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
                <div>or</div>
                <div>
                    <Button
                        color="link"
                        onClick={() => {
                            this._createNew();
                        }}
                    >
                        <i className="fas fa-plus fa-sm" aria-hidden="true" /> Create New Access
                    </Button>
                </div>
            </div>
        );
    };

    private _onSelected = (access: IAccess) => {
        // onChange is called when deselected
        if (!access || !access.name) {
            this.props.onDeselect();
        } else {
            this.props.onSelect({
                ...access
            });
        }
    };

    private _createNew = () => {
        this.props.onSelect({
            assignments: [],
            id: 0,
            name: "",
            tags: "",
            teamId: 0
        });
    };
}
