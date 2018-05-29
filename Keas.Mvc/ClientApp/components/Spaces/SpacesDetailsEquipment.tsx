import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IEquipment } from "../../Types";
import EquipmentList from "../Equipment/EquipmentList";

interface IProps {
    spaceId: number;
}

interface IState {
    equipment: IEquipment[];
    loading: boolean;
}

export default class SpacesDetailsEquipment extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            equipment: [],
            loading: false,
        };
    }

    public async componentDidMount() {
        this.setState({ loading: true });
        const equipment = !!this.props.spaceId === null ? [] :
            await this.context.fetch(`/api/${this.context.team.name}/equipment/getEquipmentInSpace?spaceId=${this.props.spaceId}`);
        this.setState({ equipment, loading: false });
    }

    public render() {
        if (this.props.spaceId === null)
        {
            return null;
        }
        if (this.state.loading)
        {
            return (<div>Loading Equipment...</div>);
        }
        return (
            <div className="form-group">
                <h5><i className="fas fa-laptop fa-xs"></i> Equipment</h5>
                {this.state.equipment.length > 0 ? 
                    <EquipmentList equipment={this.state.equipment} showDetails={this._openDetailsModal} /> : "No Equipment"}
            </div>
        );
    }

    private _openDetailsModal = (equipment: IEquipment) => {
        this.context.router.history.push(
            `../../equipment/details/${equipment.id}`
        );
    };
}
