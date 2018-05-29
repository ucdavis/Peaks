import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IKey } from "../../Types";

interface IProps {
    spaceId: number;
}

interface IState {
    keys: IKey[];
    loading: boolean;
}

export default class SpacesDetailsKeys extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            keys: [],
            loading: false,
        };
    }

    public async componentDidMount() {
        this.setState({ loading: true });
        const keys = !!this.props.spaceId === null ? [] :
            await this.context.fetch(`/api/${this.context.team.name}/keys/getKeysInSpace?spaceId=${this.props.spaceId}`);
        this.setState({ keys, loading: false });
    }

    public render() {
        if (this.props.spaceId === null)
        {
            return null;
        }
        if (this.state.loading)
        {
            return (<div>Loading Keys...</div>);
        }
        return (
            <div className="form-group">
                <h5>Keys</h5>
                {this.state.keys.length > 0 ? this._renderTable() : "No Keys"}
            </div>
        );
    }

    private _renderTable = () => {
        const keysBody = this.state.keys.map(x => (
            <tr key={x.id}>
                <td>{x.name}</td>
                <td>{x.serialNumber}</td>
                <td>{x.assignment ? x.assignment.person.user.name : ""}</td>
                <td>{x.assignment ? x.assignment.expiresAt : ""}</td>
                <td>
                    <NavLink to={`../../keys/details/${x.id}`} >
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
        <tbody>{keysBody}</tbody>
    </table>);
    }
}
