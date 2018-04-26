import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";

import { AppContext, IEquipment } from "../../Types";

interface IProps {
    selectedEquipment?: IEquipment;
    onSelect: (equipment: IEquipment) => void;
    onDeselect: () => void;
}

interface IState {
    equipment: IEquipment[];
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
                    filterBy={() => true} //don't filter on top of our search
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
                        const equipment = await this.context.fetch(
                            `/equipment/search?teamId=${this.context.team.id}&q=${query}`
                        );
                        this.setState({
                            isSearchLoading: false,
                            equipment
                        });
                    }}
                    onChange={selected => {
                        if (selected && selected.length === 1) {
                            this._onSelected(selected[0]);
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
                attributes: [],
                id: equipment.teamId ? equipment.id : 0,
                make: equipment.make ? equipment.make : "",
                model: equipment.model ? equipment.model : "",
                name: equipment.name,
                room: equipment.room ? equipment.room : null,
                serialNumber: equipment.serialNumber ? equipment.serialNumber : "",
                teamId: equipment.teamId ? equipment.teamId : 0,
                type: "Phone"
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
