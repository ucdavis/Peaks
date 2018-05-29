import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IEquipment } from "../../Types";

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
                <h5>Equipment</h5>
                {this.state.equipment.length > 0 ? this._renderTable() : "No Equipment"}
            </div>
        );
    }

    private _renderTable = () => {
        const equipBody = this.state.equipment.map(x => (
            <tr key={x.id}>
                <td>{x.name}</td>
                <td>{x.serialNumber}</td>
                <td>{x.assignment ? x.assignment.person.user.name : ""}</td>
                <td>{x.assignment ? x.assignment.expiresAt : ""}</td>
                <td>
                    <NavLink to={`../../equipment/details/${x.id}`} >
                        View Details
                    </NavLink>
                </td>
            </tr>
        ));

        return(<table className="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Serial Number</th>
                <th>Assigned To</th>
                <th>Expires At</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>{equipBody}</tbody>
    </table>);
    }
}
