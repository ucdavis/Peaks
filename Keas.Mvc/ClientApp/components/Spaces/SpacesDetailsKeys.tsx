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
            return (<div>Loading Equipment...</div>);
        }
        const keysList = this.state.keys.length > 0 ? this.state.keys.map(x => (
            <div key={x.id}>
                <NavLink to={`../../keys/details/${x.id}`} >
                    {x.name}
                </NavLink>
            </div>
        )) : (<div>No Keys</div>);
        return (
            <div className="form-group">
                <label>Keys</label><br />
                {keysList}
            </div>
        );
    }
}
