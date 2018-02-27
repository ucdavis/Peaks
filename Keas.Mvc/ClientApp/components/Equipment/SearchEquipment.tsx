import PropTypes from "prop-types";
import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";

import { IEquipment } from "../../Types";

interface IProps {
    equipmentList: IEquipment[];
    selectedEquipment?: IEquipment;
    loading: boolean;
    onSelect: (equipment: IEquipment) => void;
    onDeselect: () => void;
}

// Search for existing equipment then send selection back to parent
export default class SearchEquipment extends React.Component<IProps, {}> {

    private _onSelected = (equipment: IEquipment) => {
        //onChange is called when deselected
        if (equipment == null || equipment.name == null) {
            this.props.onDeselect();
        }
        else {
            //if teamId is not set, this is a new equipment
            this.props.onSelect({
                name: equipment.name,
                id: equipment.teamId ? equipment.id : 0,
                teamId: equipment.teamId ? equipment.teamId : 0,
                serialNumber: "12345",
                make: "Make",
                model: "Model",
                type: "Phone"
            });
        }
    };

    public render() {
        if (this.props.loading) return <div>Loading ... </div>;

        return (
            <div>
                <Typeahead
                    labelKey="name"
                    disabled={this.props.selectedEquipment != null}
                    selected={this.props.selectedEquipment != null ? [this.props.selectedEquipment] : []}
                    multiple={false}
                    allowNew={true}
                    minLength={2}
                    options={this.props.equipmentList}
                    placeholder="Assign a new equipment"
                    newSelectionPrefix="Create a new equipment"
                    onChange={(selected) => {
                        this._onSelected(selected[0]);
                    }}
                />
            </div>

        );
    }
}
