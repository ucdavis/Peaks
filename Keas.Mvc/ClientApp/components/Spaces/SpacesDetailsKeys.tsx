import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import { AppContext, IKey } from "../../Types";
import KeyList from "../Keys/KeyList";

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
        const keys = this.props.spaceId === null ? [] :
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
                <h5><i className="fas fa-key fa-xs"></i> Keys</h5>
                {this.state.keys.length > 0 ? 
                    <KeyList keys={this.state.keys} showDetails={this._openDetailsModal} /> : "No Keys"}
            </div>
        );
    }

    private _openDetailsModal = (key: IKey) => {
        this.context.router.history.push(
            `../../keys/details/${key.id}`
        );
    };
}
