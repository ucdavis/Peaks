import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { AppContext, ISpace, IWorkstation } from "../../Types";

interface IProps {
    selectedWorkstation?: IWorkstation;
    space: ISpace;
    onSelect: (workstation: IWorkstation) => void;
    onDeselect: () => void;
}

interface IState {
    isSearchLoading: boolean;
    workstations: IWorkstation[];
}

// Search for existing workstation then send selection back to parent
export default class SearchWorkstations extends React.Component<IProps, IState> {
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
            workstations: [],
        };
    }

    public render() {
        if (this.props.selectedWorkstation != null) {
            return this._renderExistingWorkstation();
        }
        else {
            return this._renderSelectWorkstation();
        }
    }

    private _renderSelectWorkstation = () => {

        return (
            <div>
                <AsyncTypeahead
                    isLoading={this.state.isSearchLoading}
                    minLength={3}
                    placeholder="Search for workstation by name or room"
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
                                    Room: {" "}
                                    <Highlighter key="space.roomNumber" search={props.text}>{option.space.roomNumber}</Highlighter>
                                    {" "} 
                                    <Highlighter key="space.bldgName" search={props.text}>{option.space.bldgName}</Highlighter>
                                </small>
                            </div>
                        </div>
                    )}
                    onSearch={async query => {
                        this.setState({ isSearchLoading: true });
                        const workstations = await this.context.fetch(
                            `/api/${this.context.team.name}/workstations/search?q=${query}&spaceId=${this.props.space ? this.props.space.id : null}`
                        );
                        this.setState({
                            isSearchLoading: false,
                            workstations
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this._onSelected(selected[0]);
                        }
                    }}
                    options={this.state.workstations}
                />
            </div>
        );
    }

    private _renderExistingWorkstation = () => {
        return (
            <input
                type="text"
                className="form-control"
                value={this.props.selectedWorkstation.name}
                disabled={true}
            />
        );
    };

    private _onSelected = (workstation: IWorkstation) => {
        // onChange is called when deselected
        if (workstation == null || workstation.name == null) {
            this.props.onDeselect();
        }
        else {
            // if teamId is not set, this is a new workstation
            this.props.onSelect({
                id: workstation.teamId ? workstation.id : 0,
                name: workstation.name,
                space: workstation.teamId ? workstation.space : this.props.space,
                tags: workstation.teamId ? workstation.tags : "",
                teamId: workstation.teamId ? workstation.teamId : 0,
            });
        }
    };
}
