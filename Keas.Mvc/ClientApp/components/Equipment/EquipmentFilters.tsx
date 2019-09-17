import * as PropTypes from "prop-types";
import * as React from "react";
import { toast } from "react-toastify";
import { AppContext, IEquipment } from "../../Types";
import SearchTags from "../Tags/SearchTags";
import SearchAttributes from "./SearchAttributes";
import SearchEquipmentType from "./SearchEquipmentType";

interface IProps {
    equipment: IEquipment[];
    equipmentAvailabilityLevels: string[];
    equipmentProtectionLevels: string[];
    equipmentTypes: string[];
    tags: string[];
}

interface IState {
    attributeFilters: string[];
    equipmentAvailabilityFilters: string[];
    equipmentProtectionFilters: string[];
    equipmentTypeFilters: string[];
    tagFilters: string[];
}

export default class EquipmentFilters extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            attributeFilters: [],
            equipmentAvailabilityFilters: [],
            equipmentProtectionFilters: [],
            equipmentTypeFilters: [],
            tagFilters: []
        };
    }

    public render() {
        let filteredEquipment = this.props.equipment;
        if (this.state.tagFilters.length > 0) {
            filteredEquipment = filteredEquipment.filter(x =>
                this._checkTagFilters(x, this.state.tagFilters)
            );
        }
        if (this.state.attributeFilters.length > 0) {
            filteredEquipment = filteredEquipment.filter(x =>
                this._checkAttributeFilters(x, this.state.attributeFilters)
            );
        }
        if (this.state.equipmentTypeFilters.length > 0) {
            filteredEquipment = filteredEquipment.filter(x => this._checkEquipmentTypeFilters(x));
        }
        if (this.state.equipmentProtectionFilters.length > 0) {
            filteredEquipment = filteredEquipment.filter(x =>
                this._checkEquipmentProtectionFilters(x)
            );
        }
        if (this.state.equipmentAvailabilityFilters.length > 0) {
            filteredEquipment = filteredEquipment.filter(x =>
                this._checkEquipmentAvailabilityFilters(x)
            );
        }
        return (
            <div>
                <div className="row">
                    <SearchTags
                        tags={this.props.tags}
                        selected={this.state.tagFilters}
                        onSelect={this._filterTags}
                        disabled={false}
                    />
                    <SearchAttributes
                        selected={this.state.attributeFilters}
                        onSelect={this._filterAttributes}
                        disabled={false}
                    />
                    <SearchEquipmentType
                        equipmentTypes={this.props.equipmentTypes}
                        selected={this.state.equipmentTypeFilters}
                        onSelect={this._filterEquipmentType}
                        disabled={false}
                        placeHolder="Search for Equipment Types"
                    />
                    <SearchEquipmentType
                        equipmentTypes={this.props.equipmentProtectionLevels}
                        selected={this.state.equipmentProtectionFilters}
                        onSelect={this._filterEquipmentProtection}
                        disabled={false}
                        placeHolder="Search Protection Level"
                    />
                    <SearchEquipmentType
                        equipmentTypes={this.props.equipmentAvailabilityLevels}
                        selected={this.state.equipmentAvailabilityFilters}
                        onSelect={this._filterEquipmentAvailability}
                        disabled={false}
                        placeHolder="Search Availability Level"
                    />
                </div>
                <EquipmentTable
                    equipment={filteredEquipment}
                    onRevoke={this._openRevokeModal}
                    onDelete={this._openDeleteModal}
                    onAdd={this._openAssignModal}
                    showDetails={this._openDetailsModal}
                    onEdit={this._openEditModal}
                />
            </div>
        );
    }

    private _filterEquipmentType = (filters: string[]) => {
        this.setState({ equipmentTypeFilters: filters });
    };

    private _filterEquipmentProtection = (filters: string[]) => {
        this.setState({ equipmentProtectionFilters: filters });
    };
    private _filterEquipmentAvailability = (filters: string[]) => {
        this.setState({ equipmentAvailabilityFilters: filters });
    };

    private _checkEquipmentTypeFilters = (equipment: IEquipment) => {
        const filters = this.state.equipmentTypeFilters;
        return filters.some(
            f =>
                (equipment && !!equipment.type && equipment.type === f) ||
                (equipment && !equipment.type && f === "Default")
        );
    };

    private _checkEquipmentProtectionFilters = (equipment: IEquipment) => {
        const filters = this.state.equipmentProtectionFilters;
        return filters.some(
            f => equipment && !!equipment.protectionLevel && equipment.protectionLevel === f
        );
    };

    private _checkEquipmentAvailabilityFilters = (equipment: IEquipment) => {
        const filters = this.state.equipmentAvailabilityFilters;
        return filters.some(
            f => equipment && !!equipment.availabilityLevel && equipment.availabilityLevel === f
        );
    };

    private _filterTags = (filters: string[]) => {
        this.setState({ tagFilters: filters });
    };

    private _checkTagFilters = (equipment: IEquipment, filters: string[]) => {
        return filters.every(f => !!equipment && !!equipment.tags && equipment.tags.includes(f));
    };

    private _filterAttributes = (filters: string[]) => {
        this.setState({ attributeFilters: filters });
    };

    private _checkAttributeFilters = (equipment: IEquipment, filters) => {
        for (const filter of filters) {
            if (
                !equipment.attributes ||
                equipment.attributes.findIndex(
                    x =>
                        x.key.toLowerCase() === filter.label.toLowerCase() ||
                        x.value.toLowerCase() === filter.label.toLowerCase()
                ) === -1
            ) {
                // if we cannot find an index where some of our filter matches the key
                return false;
            }
        }
        return true;
    };
}
