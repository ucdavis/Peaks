import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { AppContext, IEquipment, IEquipmentSearch, ISpace } from "../../Types";

interface IProps {
    selectedEquipment?: IEquipment;
    onSelect: (equipment: IEquipment) => void;
    onDeselect: () => void;
    space: ISpace // used to set default space if we are on spaces tab
}

interface IState {
    equipment: IEquipmentSearch[];
    isSearchLoading: boolean;
}

// Search for existing equipment then send selection back to parent
export default class SearchEquipment extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            equipment: [],
            isSearchLoading: false,
        };
    }

    public render() {
        if (this.props.selectedEquipment != null) {
            return this._renderExistingEquipment();
        }
        else {
            return this._renderSelectEquipment();
        } 
    }

    private _renderSelectEquipment = () => {

        return (
            <div>
                <AsyncTypeahead
                    isLoading={this.state.isSearchLoading}
                    minLength={3}
                    placeholder="Search for equipment by name or by serial number"
                    labelKey="name"
                    filterBy={() => true} // don't filter on top of our search
                    allowNew={true}
                    renderMenuItemChildren={(option, props, index) => (
                        <div>
                            <div>
                                <Highlighter key="equipment.name" search={props.text}>
                                    {option.equipment.name}
                                </Highlighter>
                            </div>
                            <div>
                                {option.disabled ? "Assigned" : "Unassigned"}
                            </div>
                            <div>
                                <small>
                                    Serial Number:
                                    <Highlighter key="equipment.serialNumber" search={props.text}>{option.equipment.serialNumber}</Highlighter>
                                </small>
                            </div>
                        </div>
                    )}
                    onSearch={async query => {
                        this.setState({ isSearchLoading: true });
                        const equipment = await this.context.fetch(
                            `/api/${this.context.team.slug}/equipment/search?q=${query}`
                        );
                        this.setState({
                            equipment,
                            isSearchLoading: false,
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this._onSelected(selected[0].equipment);
                        }
                    }}
                    options={this.state.equipment}
                />
            </div>
        );
    }

    private _onSelected = (equipment: IEquipment) => {
        // onChange is called when deselected
        if (equipment == null || equipment.name == null) {
            this.props.onDeselect();
        }
        else {
            // if teamId is not set, this is a new equipment
            this.props.onSelect({
                attributes: !!equipment.attributes ? equipment.attributes : 
                [ 
                {
                    equipmentId: 0,
                    key: "",
                    value: "",
                  }
                ],
                id: equipment.teamId ? equipment.id : 0,
                make: equipment.make ? equipment.make : "",
                model: equipment.model ? equipment.model : "",
                name: equipment.name,
                serialNumber: equipment.serialNumber ? equipment.serialNumber : "",
                space: this.props.space ? this.props.space : equipment.space, // if we are on spaces tab, auto to the right space
                tags: "",
                teamId: equipment.teamId ? equipment.teamId : 0,
                type: ""
            });
        }
    };

    private _renderExistingEquipment = () => {
        return (
            <input
                type="text"
                className="form-control"
                value={this.props.selectedEquipment.name}
                disabled={true}
            />
        );
    };
}
