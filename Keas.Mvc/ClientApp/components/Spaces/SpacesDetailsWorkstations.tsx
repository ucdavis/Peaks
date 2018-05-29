import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IWorkstation } from "../../Types";

interface IProps {
    spaceId: number;
}

interface IState {
    loading: boolean;
    workstations: IWorkstation[];
}

export default class SpacesDetailsWorkstations extends React.Component<IProps, IState> {

    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            workstations: [],
        };
    }

    public async componentDidMount() {
        this.setState({ loading: true });
        const workstations = this.props.spaceId === null ? [] :
            await this.context.fetch(`/api/${this.context.team.name}/workstation/getWorkstationsInSpace?spaceId=${this.props.spaceId}`);
        this.setState({ workstations, loading: false });
    }

    public render() {
        if (this.props.spaceId === null)
        {
            return null;
        }
        if (this.state.loading)
        {
            return (<div>Loading Workstations...</div>);
        }
        return (
            <div className="form-group">
                <h5><i className="fas fa-user fa-xs"></i> Workstations</h5>
                {this.state.workstations.length > 0 ? this._renderTable() : "No Workstations"}
            </div>
        );
    }

    private _renderTable = () => {
        const workstationsBody = this.state.workstations.map(x => (
            <tr key={x.id}>
                <td>{x.name}</td>
                <td>{x.assignment ? x.assignment.person.user.name : ""}</td>
                <td>{x.assignment ? x.assignment.expiresAt : ""}</td>
                <td>
                    <NavLink to={`../../workstations/details/${x.id}`} >
                        View Details
                    </NavLink>
                </td>
            </tr>
        ));

        return(<table className="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Assigned To</th>
                <th>Expires At</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>{workstationsBody}</tbody>
    </table>);
    }
}
