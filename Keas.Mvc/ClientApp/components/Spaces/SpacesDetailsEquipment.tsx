import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IEquipment } from "../../Types";

interface IProps {
    roomKey: string;
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
        const equipment = !this.props.roomKey ? [] :
            await this.context.fetch(`/equipment/getEquipmentInRoom?roomKey=${this.props.roomKey}`);
        this.setState({ equipment, loading: false });
    }

    public render() {
        if (!this.props.roomKey)
        {
            return null;
        }
        if (this.state.loading)
        {
            return (<div>Loading Equipment...</div>);
        }
        const equipmentList = this.state.equipment.length > 0 ? this.state.equipment.map(x => (
            <div>
                <NavLink key={x.id} to={`../../equipment/details/${x.id}`} >
                    {x.name}
                </NavLink>
            </div>
        )) : (<div>No Equipment</div>);
        return (
            <div className="form-group">
                <label>Equipment</label><br />
                {equipmentList}
            </div>
        );
    }
}
