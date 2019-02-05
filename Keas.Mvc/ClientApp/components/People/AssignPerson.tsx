import * as PropTypes from "prop-types";
import * as React from "react";
import { AsyncTypeahead, Highlighter } from "react-bootstrap-typeahead";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { AppContext, IPerson } from "../../Types";

interface IProps {
    onSelect: (person: IPerson) => void;
    person?: IPerson;
    disabled: boolean;
    isRequired: boolean;
}

interface IState {
    modal: boolean;
    isSearchLoading: boolean;
    people: IPerson[];
}

// TODO: need a way to clear out selected person
// Assign a person via search lookup, unless a person is already provided
export default class AssignPerson extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            isSearchLoading: false,
            modal: false,
            people: []
        };
    }

    public render() {
        return this._renderFindPerson();
    }

    private _renderFindPerson = () => {
        // call onSelect when a user is found
        return (
            <div>
                <div>
                    <AsyncTypeahead
                        isInvalid={this.props.isRequired && !this.props.person}
                        disabled={this.props.disabled}
                        isLoading={this.state.isSearchLoading}
                        minLength={3}
                        defaultSelected={this.props.person ? [this.props.person] : []}
                        placeholder="Search for person by name or email"
                        labelKey={(option: IPerson) => `${option.name} (${option.email})`}
                        filterBy={() => true} // don't filter on top of our search
                        renderMenuItemChildren={(option, props, index) => (
                            <div>
                                <div>
                                    <Highlighter key="name" search={props.text}>
                                        {option.name}
                                    </Highlighter>
                                </div>
                                <div>
                                    <Highlighter key="email" search={props.text}>
                                        {option.email}
                                    </Highlighter>
                                </div>
                            </div>
                        )}
                        onSearch={async query => {
                            this.setState({ isSearchLoading: true });
                            const people = await this.context.fetch(
                                `/api/${this.context.team.slug}/people/searchPeople?q=${query}`
                            );
                            this.setState({
                                isSearchLoading: false,
                                people
                            });
                        }}
                        onChange={selected => {
                            if (selected && selected.length === 1) {
                                this.props.onSelect(selected[0]);
                            }
                            if (selected && selected.length === 0) {
                                this.props.onSelect(null);
                            }
                        }}
                        options={this.state.people}
                    />
                </div>
                <div>
                    <Link to={`/${this.context.team.slug}/people/create`}>
                        <Button color="link">
                            <i className="fas fa-search fas-sm" aria-hidden="true" /> Can't find who
                            you're looking for?
                        </Button>
                    </Link>
                </div>
            </div>
        );
    };
}
