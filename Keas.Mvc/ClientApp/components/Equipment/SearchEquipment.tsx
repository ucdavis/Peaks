import PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import {Button, Input, InputGroup, InputGroupAddon} from "reactstrap";

import { AppContext, IEquipment, IEquipmentLabel, ISpace } from "../../Types";

interface IProps {
    selectedEquipment?: IEquipment;
    onSelect: (equipment: IEquipment) => void;
    onDeselect: () => void;
    openDetailsModal: (equipment:IEquipment) => void;
    space: ISpace // used to set default space if we are on spaces tab
}

interface IState {
    equipment: IEquipmentLabel[];
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
                    labelKey="label"
                    filterBy={() => true} // don't filter on top of our search
                    allowNew={true}
                    renderMenuItemChildren={(option, props, index) => (
                        <div className={!!option.equipment.assignment ? "disabled" : ""}>
                            <div>
                                <Highlighter key="equipment.name" search={props.text}>
                                    {option.equipment.name}
                                </Highlighter>
                            </div>
                            <div>
                                {!!option.equipment.assignment ? "Assigned" : "Unassigned"}
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
                            if(!!selected[0].equipment && !!selected[0].equipment.assignment)
                            {
                                this.props.openDetailsModal(selected[0].equipment);
                            }
                            else 
                            {
                                this._onSelected(selected[0]);
                            }
                        }
                    }}
                    options={this.state.equipment}
                />
            </div>
        );
    }

    private _onSelected = (equipmentLabel: IEquipmentLabel) => {
        // onChange is called when deselected
        if (equipmentLabel == null || equipmentLabel.label == null) {
            this.props.onDeselect();
        }
        else {
            // if teamId is not set, this is a new equipment
            this.props.onSelect({
                attributes: !!equipmentLabel.equipment ? equipmentLabel.equipment.attributes : 
                [ 
                {
                    equipmentId: 0,
                    key: "",
                    value: "",
                  }
                ],
                id: equipmentLabel.equipment ? equipmentLabel.equipment.id : 0,
                make: equipmentLabel.equipment ? equipmentLabel.equipment.make : "",
                model: equipmentLabel.equipment ? equipmentLabel.equipment.model : "",
                name: equipmentLabel.equipment ? equipmentLabel.equipment.name : equipmentLabel.label,
                serialNumber: equipmentLabel.equipment ? equipmentLabel.equipment.serialNumber : "",
                space: this.props.space ? this.props.space : 
                    (equipmentLabel.equipment ? equipmentLabel.equipment.space : null), // if we are on spaces tab, auto to the right space
                tags: "",
                teamId: equipmentLabel.equipment ? equipmentLabel.equipment.teamId : 0,
                type: ""
            });
        }
    };

    private _renderExistingEquipment = () => {
        return (
            <InputGroup>
                <Input
                    type="text"
                    className="form-control"
                    value={this.props.selectedEquipment.name}
                    disabled={true}
                />
                <InputGroupAddon addonType="append"><Button color="danger" onClick={() => {this._onSelected(null)}}>X</Button></InputGroupAddon>
            </InputGroup>

        );
    };
}
