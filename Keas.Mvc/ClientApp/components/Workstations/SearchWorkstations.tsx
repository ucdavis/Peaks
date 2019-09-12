import * as PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { AppContext, ISpace, IWorkstation } from "../../Types";

interface IProps {
    selectedWorkstation?: IWorkstation;
    space: ISpace;
    onSelect: (workstation: IWorkstation) => void;
    openDetailsModal: (workstation: IWorkstation) => void;
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
            workstations: []
        };
    }

    public render() {
        if (this.props.selectedWorkstation != null) {
            return this._renderExistingWorkstation();
        } else {
            return this._renderSelectWorkstation();
        }
    }

    private _renderSelectWorkstation = () => {
        return (
            <div>
                <label>Pick a workstation to assign</label>
                <div>
                    <AsyncTypeahead
                        id="searchWorkstations" // for accessibility
                        isLoading={this.state.isSearchLoading}
                        minLength={3}
                        placeholder="Search for workstation by name or room"
                        labelKey="name"
                        filterBy={() => true} // don't filter on top of our search
                        allowNew={false}
                        renderMenuItemChildren={(option, props, index) => (
                            <div className={!!option.assignment ? "disabled" : ""}>
                                <div>
                                    <Highlighter key="name" search={props.text}>
                                        {option.name}
                                    </Highlighter>
                                </div>
                                <div>{!!option.assignment ? "Assigned" : "Unassigned"}</div>
                                <div>
                                    <small>
                                        Space:
                                        <Highlighter key="space.roomNumber" search={props.text}>
                                            {option.space.roomNumber}
                                        </Highlighter>
                                        <Highlighter key="space.bldgName" search={props.text}>
                                            {option.space.bldgName}
                                        </Highlighter>
                                    </small>
                                </div>
                            </div>
                        )}
                        onSearch={this._onSearch}
                        onChange={selected => {
                            if (selected && selected.length === 1) {
                                if (!!selected[0] && !!selected[0].assignment) {
                                    this.props.openDetailsModal(selected[0]);
                                } else {
                                    this._onSelected(selected[0]);
                                }
                            }
                        }}
                        options={this.state.workstations}
                    />
                </div>
                <div>or</div>
                <div>
                    <Button color="link" onClick={this._createNew}>
                        <i className="fas fa-plus fa-sm" aria-hidden="true" /> Create New
                        Workstation
                    </Button>
                </div>
            </div>
        );
    };

    private _onSearch = async (query: string) => {
        const searchUrl = this.props.space
            ? `/api/${this.context.team.slug}/workstations/searchInSpace?spaceId=${this.props.space.id}&q=`
            : `/api/${this.context.team.slug}/workstations/search?q=`;

        this.setState({ isSearchLoading: true });
        let workstations: IWorkstation[] = null;
        try {
            workstations = await this.context.fetch(searchUrl + query);
        } catch (err) {
            toast.error("Error searching workstations.");
            this.setState({ isSearchLoading: false });
            return;
        }
        this.setState({
            isSearchLoading: false,
            workstations
        });
    };
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
        if (!workstation || !workstation.name) {
            this.props.onDeselect();
        } else {
            // if teamId is not set, this is a new workstation
            this.props.onSelect(workstation);
        }
    };

    private _createNew = () => {
        this.props.onSelect({
            id: 0,
            name: "",
            space: this.props.space ? this.props.space : null, // if we are on spaces tab, auto to the right space
            tags: "",
            notes: "",
            teamId: 0
        });
    };
}
