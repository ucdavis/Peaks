import * as PropTypes from "prop-types";
import * as React from "react";
import { AppContext, IPerson, IPersonInfo } from "../../Types";
import { PermissionsUtil } from "../../util/permissions";
import Denied from "../Shared/Denied";
import SearchTags from "../Tags/SearchTags";
import CreatePerson from "./CreatePerson";
import PeopleTable from "./PeopleTable";
import PersonDetails from "./PersonDetails";

interface IState {
    loading: boolean;
    people: IPersonInfo[];
    tableFilters: any[]; // object containing filters on table
    tagFilters: string[]; // string of tag filters
    tags: string[]; // existing tags that are options for SearchTags
}
export default class PeopleContainer extends React.Component<{}, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        permissions: PropTypes.array,
        router: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            people: [],
            tableFilters: [],
            tagFilters: [],
            tags: []
        };
    }

    public async componentDidMount() {
        const people = await this.context.fetch(`/api/${this.context.team.slug}/search/peopleList/`);
        const tags = await this.context.fetch(`/api/${this.context.team.slug}/tags/listTags`);

        this.setState({ loading: false, people, tags });
    }

    public render() {
        if (!PermissionsUtil.canViewPeople(this.context.permissions)) {
            return <Denied viewName="People" />;
        }

        if (this.state.loading) {
            return <h2>Loading...</h2>;
        }

        const { personAction, assetType, personId } = this.context.router.route.match.params;
        const selectedId = parseInt(personId, 10);
        const detailPerson = this.state.people.find(e => e.id === selectedId);

        return (
            <div className="card people-color">
                <div className="card-header-people">
                    <div className="card-head">
                        <h2>
                            <i className="fas fa-users fa-xs" /> People
                        </h2>
                    </div>
                </div>
                <div className="card-content">
                    {(!personAction || personAction === "create") &&
                        this._renderTableView(personAction === "create")}
                    {personAction === "details" &&
                        !!detailPerson &&
                        !!detailPerson.person &&
                        this._renderDetailsView(detailPerson)}
                </div>
            </div>
        );
    }

    private _renderTableView = (createModal: boolean) => {
        let filteredPeople = this.state.people;
        if (this.state.tagFilters.length > 0) {
            filteredPeople = filteredPeople.filter(x =>
                this._checkTagFilters(x.person, this.state.tagFilters)
            );
        }
        return (
            <div>
                <SearchTags
                    tags={this.state.tags}
                    selected={this.state.tagFilters}
                    onSelect={this._filterTags}
                    disabled={false}
                />
                <PeopleTable
                    people={filteredPeople}
                    showDetails={this._openDetailsModal}
                    filtered={this.state.tableFilters}
                    updateFilters={this._updateTableFilters}
                />
                <CreatePerson
                    onCreate={this._createPerson}
                    modal={createModal}
                    onAddNew={this._openCreateModal}
                    closeModal={this._goBack}
                    tags={this.state.tags}
                    userIds={this.state.people.map(x => x.person.userId)}
                />
            </div>
        );
    };

    private _renderDetailsView = (detailPerson: IPersonInfo) => {
        return (
            <PersonDetails
                selectedPersonInfo={detailPerson}
                tags={this.state.tags}
                goBack={this._goBack}
                inUseUpdated={this._assetInUseUpdated}
                onEdit={this._editPerson}
                onDelete={this._deletePerson}
            />
        );
    };

    private _updateTableFilters = (filters: any[]) => {
        this.setState({ tableFilters: filters });
    };

    // managing counts for assigned or revoked
    private _assetInUseUpdated = (
        type: string,
        spaceId: number,
        personId: number,
        count: number
    ) => {
        const index = this.state.people.findIndex(x => x.id === personId);
        if (index > -1) {
            const people = [...this.state.people];
            switch (type) {
                case "equipment":
                    people[index].equipmentCount += count;
                    break;
                case "serial":
                    people[index].keyCount += count;
                    break;
                case "access":
                    people[index].accessCount += count;
                    break;
                case "workstation":
                    people[index].workstationCount += count;
            }
            this.setState({ people });
        }
    };

    // tags
    private _filterTags = (filters: string[]) => {
        this.setState({ tagFilters: filters });
    };

    private _checkTagFilters = (person: IPerson, filters: string[]) => {
        return filters.every(f => !!person && !!person.tags && person.tags.includes(f));
    };

    private _createPerson = async (person: IPerson) => {
        const index = this.state.people.findIndex(x => x.person.userId === person.userId);
        if (index !== -1) {
            // if we somehow already have this person, return
            return;
        }
        person.teamId = this.context.team.id;
        // any errors here are caught in CreatePerson
        person = await this.context.fetch(`/api/${this.context.team.slug}/search/createPerson`, {
            body: JSON.stringify(person),
            method: "POST"
        });
        if (!person) {
            return;
        }
        // since this is a new person, they will not have anything assigned
        const personInfo: IPersonInfo = {
            accessCount: 0,
            equipmentCount: 0,
            id: person.id,
            keyCount: 0,
            person,
            workstationCount: 0
        };
        this.setState({
            people: [...this.state.people, personInfo]
        });
    };

    private _editPerson = async (person: IPerson) => {
        const index = this.state.people.findIndex(x => x.id === person.id);

        if (index === -1) {
            // should always already exist
            return;
        }

        const updated: IPerson = await this.context.fetch(
            `/api/${this.context.team.slug}/people/update`,
            {
                body: JSON.stringify(person),
                method: "POST"
            }
        );

        // update already existing entry in key
        const updatePeople = [...this.state.people];
        updatePeople[index].person = updated;

        this.setState({
            ...this.state,
            people: updatePeople
        });
    };

    private _deletePerson = async (person: IPerson) => {
        const index = this.state.people.findIndex(x => x.id === person.id);

        if (index === -1) {
            // should always already exist
            return;
        }

        if (!confirm("Are you should you want to delete person?")) {
            return false;
        }

        const deleted: IPerson = await this.context.fetch(
            `/api/${this.context.team.slug}/people/delete`,
            {
                body: JSON.stringify(person),
                method: "POST"
            }
        );

        this._goBack();

        // update already existing entry in key
        const updatePeople = [...this.state.people];
        updatePeople.splice(index, 1);

        this.setState({
            ...this.state,
            people: updatePeople
        });
    };

    private _openCreateModal = () => {
        this.context.router.history.push(`${this._getBaseUrl()}/people/create`);
    };

    private _openDetailsModal = (person: IPerson) => {
        this.context.router.history.push(`${this._getBaseUrl()}/people/details/${person.id}`);
    };

    private _goBack = () => {
        this.context.router.history.push(`${this._getBaseUrl()}/people`);
    };

    private _getBaseUrl = () => {
        return `/${this.context.team.slug}`;
    };
}
