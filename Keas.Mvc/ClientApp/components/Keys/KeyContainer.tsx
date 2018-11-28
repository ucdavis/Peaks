import * as PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson, ISpace } from "../../Types";

import AssociateSpace from "./AssociateSpace";
import CreateKey from "./CreateKey";
import Denied from "../Shared/Denied";
import EditKey from "./EditKey";
import KeyDetailContainer from "./KeyDetailContainer";
import KeyList from "./KeyList";
import KeyTable from "./KeyTable";
import SearchTags from "../Tags/SearchTags";

import { PermissionsUtil } from "../../util/permissions";

interface IProps {
    assetInUseUpdated?: (
        type: string,
        spaceId: number,
        personId: number,
        count: number
    ) => void;

    assetTotalUpdated?: (
        type: string,
        spaceId: number,
        personId: number,
        count: number
    ) => void;

    assetEdited?: (type: string, spaceId: number, personId: number) => void;
    person?: IPerson;
    space?: ISpace;
}

interface IState {
    loading: boolean;
    keys: IKey[]; // either key assigned to this person, or all team keys
    tags: string[];

    tableFilters: any[];
    tagFilters: string[];
}

export default class KeyContainer extends React.Component<IProps, IState> {
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
            keys: [],
            tags: [],
            loading: true,

            tableFilters: [],
            tagFilters: []
        };
    }
    public async componentDidMount() {
        const { team } = this.context;

        // are we getting the person's key or the team's?
        let keyFetchUrl = "";
        if (!!this.props.person) {
            keyFetchUrl = `/api/${team.slug}/keys/listassigned?personid=${this.props.person.id}`;
        } else if (!!this.props.space) {
            keyFetchUrl = `/api/${team.slug}/keys/getKeysInSpace?spaceId=${this.props.space.id}`;
        } else {
            keyFetchUrl = `/api/${team.slug}/keys/list/`;
        }

        const keys = await this.context.fetch(keyFetchUrl);

        const tags = await this.context.fetch(
            `/api/${team.slug}/tags/listTags`
        );

        this.setState({ keys, tags, loading: false });
    }

    public render() {
        if (!PermissionsUtil.canViewKeys(this.context.permissions)) {
            return <Denied viewName="Keys" />;
        }

        if (this.state.loading) {
            return <h2>Loading...</h2>;
        }

        const { space } = this.props;
        const { tags } = this.state;
        const {
            keyAction,
            keyId,
            action
        } = this.context.router.route.match.params;

        const selectedKeyId = parseInt(keyId, 10);
        const selectedKey = this.state.keys.find(k => k.id === selectedKeyId);

        return (
            <div className="card keys-color">
                <div className="card-header-keys">
                    <div className="card-head">
                        <h2>
                            <i className="fas fa-key fa-xs" /> Keys
                        </h2>
                    </div>
                </div>
                <div className="card-content">
                    {keyAction !== "details" && this._renderTableOrListView()}
                    {keyAction === "details" && this._renderDetailsView()}

                    {!space && (
                        <CreateKey
                            onCreate={this._createKey}
                            onOpenModal={this._openCreateModal}
                            closeModal={this._closeModals}
                            modal={keyAction === "create"}
                            searchableTags={tags}
                        />
                    )}
                    <EditKey
                        onEdit={this._editKey}
                        closeModal={this._closeModals}
                        modal={keyAction === "edit"}
                        selectedKey={selectedKey}
                        searchableTags={tags}
                    />
                    {!!space && (
                        <AssociateSpace
                            selectedKey={selectedKey}
                            selectedSpace={space}
                            onAssign={this._associateSpace}
                            isModalOpen={action === "associate"}
                            openModal={this._openAssociate}
                            closeModal={this._closeModals}
                            searchableTags={tags}
                        />
                    )}
                </div>
            </div>
        );
    }

    private _renderTableOrListView() {
        const { space } = this.props;
        if (!space) {
            return this._renderTableView();
        }

        return this._renderListView();
    }

    private _renderTableView() {
        const { keys, tableFilters, tags, tagFilters } = this.state;

        let filteredKeys = keys;

        // check for tag filters
        if (tagFilters && tagFilters.length) {
            filteredKeys = keys
                .filter(k => k.tags && k.tags.length)
                .filter(k => {
                    const keyTags = k.tags.split(",");
                    return tagFilters.every(t => keyTags.includes(t));
                });
        }

        return (
            <div>
                <SearchTags
                    tags={tags}
                    disabled={false}
                    selected={tagFilters}
                    onSelect={this._onTagsFiltered}
                />
                <KeyTable
                    keys={filteredKeys}
                    onEdit={this._openEditModal}
                    showDetails={this._openDetailsModal}
                    filters={tableFilters}
                    onFiltersChange={this._onTableFiltered}
                />
            </div>
        );
    }

    private _renderListView() {
        const { space } = this.props;

        return (
            <div>
                <KeyList
                    keys={this.state.keys}
                    onEdit={this._openEditModal}
                    showDetails={this._openDetailsModal}
                    onDisassociate={
                        !!space ? k => this._disassociateSpace(space, k) : null
                    }
                />
            </div>
        );
    }

    private _renderDetailsView() {
        const { keyId } = this.context.router.route.match.params;
        const selectedKeyId = parseInt(keyId, 10);
        const selectedKey = this.state.keys.find(k => k.id === selectedKeyId);

        return (
            <KeyDetailContainer
                selectedKey={selectedKey}
                goBack={this._closeModals}
            />
        );
    }

    private _createKey = async (key: IKey) => {
        const request = {
            code: key.code,
            name: key.name,
            tags: key.tags
        };

        const createUrl = `/api/${this.context.team.slug}/keys/create`;
        key = await this.context.fetch(createUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        const index = this.state.keys.findIndex(x => x.id === key.id);
        if (index !== -1) {
            // update already existing entry in key
            const updateKeys = [...this.state.keys];
            updateKeys[index] = key;

            this.setState({
                ...this.state,
                keys: updateKeys
            });
        } else {
            this.setState({
                keys: [...this.state.keys, key]
            });
        }

        if (this.props.assetTotalUpdated) {
            this.props.assetTotalUpdated(
                "key",
                this.props.space ? this.props.space.id : null,
                this.props.person ? this.props.person.id : null,
                1
            );
        }

        return key;
    };

    private _editKey = async (key: IKey) => {
        const index = this.state.keys.findIndex(x => x.id === key.id);

        // should always already exist
        if (index < 0) {
            return;
        }

        const request = {
            code: key.code,
            name: key.name,
            tags: key.tags
        };

        const updateUrl = `/api/${this.context.team.slug}/keys/update/${
            key.id
        }`;
        key = await this.context.fetch(updateUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        // update already existing entry in key
        const updateKey = [...this.state.keys];
        updateKey[index] = key;

        this.setState({
            ...this.state,
            keys: updateKey
        });

        if (this.props.assetEdited) {
            this.props.assetEdited(
                "key",
                this.props.space ? this.props.space.id : null,
                this.props.person ? this.props.person.id : null
            );
        }

        // TODO: handle count changes once keys are related to spaces
    };

    private _associateSpace = async (space: ISpace, key: IKey) => {
        const { team } = this.context;
        const { keys } = this.state;

        // possibly create key
        if (key.id === 0) {
            key = await this._createKey(key);
        }

        const request = {
            spaceId: space.id
        };

        const associateUrl = `/api/${team.slug}/keys/associateSpace/${key.id}`;
        const association = await this.context.fetch(associateUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        const index = this.state.keys.findIndex(x => x.id === key.id);
        if (index !== -1) {
            // update already existing entry in key
            const updateKeys = [...this.state.keys];
            updateKeys[index] = key;

            this.setState({
                ...this.state,
                keys: updateKeys
            });
        } else {
            this.setState({
                keys: [...this.state.keys, key]
            });
        }
    };

    private _disassociateSpace = async (space: ISpace, key: IKey) => {
        const { team } = this.context;
        const { keys } = this.state;

        const request = {
            spaceId: space.id
        };

        const disassociateUrl = `/api/${team.slug}/keys/disassociateSpace/${
            key.id
        }`;
        const result = await this.context.fetch(disassociateUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        const updatedKeys = [...keys];
        const index = updatedKeys.findIndex(k => k.id === key.id);
        updatedKeys.splice(index, 1);

        this.setState({
            keys: updatedKeys
        });
    };

    private _onTagsFiltered = (tagFilters: string[]) => {
        this.setState({ tagFilters });
    };

    private _onTableFiltered = (tableFilters: any[]) => {
        this.setState({ tableFilters });
    };

    private _openCreateModal = () => {
        const { team } = this.context;
        this.context.router.history.push(`/${team.slug}/keys/create`);
    };

    private _openDetailsModal = (key: IKey) => {
        const { team } = this.context;
        this.context.router.history.push(
            `/${team.slug}/keys/details/${key.id}`
        );
    };

    private _openEditModal = (key: IKey) => {
        const { team } = this.context;
        this.context.router.history.push(`/${team.slug}/keys/edit/${key.id}`);
    };

    private _openAssociate = () => {
        this.context.router.history.push(
            `${this._getBaseUrl()}/keys/associate`
        );
    };

    private _closeModals = () => {
        this.context.router.history.push(`${this._getBaseUrl()}/keys`);
    };

    private _getBaseUrl = () => {
        const { person, space } = this.props;
        const slug = this.context.team.slug;

        if (!!person) {
            return `/${slug}/people/details/${person.id}`;
        }

        if (!!space) {
            return `/${slug}/spaces/details/${space.id}`;
        }

        return `/${slug}`;
    };
}
