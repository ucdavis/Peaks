import * as PropTypes from "prop-types";
import * as React from "react";
import { Button } from "reactstrap";
import { AppContext, IPerson } from "../../Types";

interface IState {
    loading: boolean;
    search: string;
}

interface IProps {
    updatePerson: (person: IPerson) => void;
}

export default class SearchUsers extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            loading: false, // controls loading icon while fetching
            search: ""
        };
    }

    public render() {
        return (
            <div className="form-group">
                <label>Search For User Using Kerberos or Email</label>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.search}
                    onChange={e => this.setState({ search: e.target.value })}
                />
                <Button
                    className="btn btn-link"
                    onClick={this._loadUser}
                    disabled={this.state.loading}
                >
                    <i className="fas fa-search fa-sm" /> Search{" "}
                    {this.state.loading ? <i className="fas fa-spin fa-spinner" /> : null}
                </Button>
            </div>
        );
    }

    private _loadUser = async () => {
        this.setState({ loading: true });
        const userFetchUrl = `/api/${this.context.team.slug}/people/searchUsers?searchTerm=${
            this.state.search
        }`;

        let person = null;
        try {
            person = await this.context.fetch(userFetchUrl);
        } catch (err) {
            if (err.message === "Not Found") {
                // on 404
                person = null;
            } else {
                // on some other error
                person = undefined;
            }
        }
        this.props.updatePerson(person);
        this.setState({ loading: false });
    };
}
