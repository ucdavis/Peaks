import * as PropTypes from "prop-types";
import * as React from "react";
import { AppContext, IKey, IKeyInfo, IPerson, ISpace } from "../../Types";
import { PermissionsUtil } from "../../util/permissions";
import Denied from "../Shared/Denied";
import SearchTags from "../Tags/SearchTags";
import AssociateSpace from "./AssociateSpace";
import CreateKey from "./CreateKey";
import DeleteKey from "./DeleteKey";
import EditKey from "./EditKey";
import KeyDetailContainer from "./KeyDetailContainer";
import KeyList from "./KeyList";
import KeyTable from "./KeyTable";

interface IProps {
    assetInUseUpdated?: (type: string, spaceId: number, personId: number, count: number) => void;

    assetTotalUpdated?: (type: string, spaceId: number, personId: number, count: number) => void;

    assetEdited?: (type: string, spaceId: number, personId: number) => void;
    person?: IPerson;
    space?: ISpace;
}

interface IState {
    loading: boolean;
    keys: IKeyInfo[]; // either key assigned to this person, or all team keys
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
            loading: true,
            tableFilters: [],
            tagFilters: [],
            tags: []
        };
    }
    public async componentDidMount() {
        const { team } = this.context;

        // are we getting the person's key or the team's?
        let keyFetchUrl = "";
        if (!!this.props.space) {
            keyFetchUrl = `/api/${team.slug}/keys/getKeysInSpace?spaceId=${this.props.space.id}`;
        } else {
            keyFetchUrl = `/api/${team.slug}/keys/list/`;
        }

        const keys = await this.context.fetch(keyFetchUrl);

        const tags = await this.context.fetch(`/api/${team.slug}/tags/listTags`);

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
        const { keyAction, keyId, action } = this.context.router.route.match.params;

        const selectedKeyId = parseInt(keyId, 10);
        const selectedKeyInfo = this.state.keys.find(k => k.id === selectedKeyId);
        const selectedKey = selectedKeyInfo ? selectedKeyInfo.key : null;

        const keyCodes = this.state.keys.map(x => x.key.code);
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
                            keyCodes={keyCodes}
                        />
                    )}
                    <EditKey
                        onEdit={this._editKey}
                        closeModal={this._closeModals}
                        modal={keyAction === "edit"}
                        selectedKey={selectedKey}
                        searchableTags={tags}
                    />
                    <DeleteKey
                        selectedKey={selectedKey}
                        deleteKey={this._deleteKey}
                        closeModal={this._closeModals}
                        modal={keyAction === "delete"}
                    />
                    {!!space && (
                        <AssociateSpace
                            selectedKeyInfo={selectedKeyInfo}
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
                .filter(k => !!k.key && k.key.tags && k.key.tags.length)
                .filter(k => {
                    const keyTags = k.key.tags.split(",");
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
                    keysInfo={filteredKeys}
                    onEdit={this._openEditModal}
                    showDetails={this._openDetailsModal}
                    onDelete={this._openDeleteModal}
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
                    keysInfo={this.state.keys}
                    onEdit={this._openEditModal}
                    showDetails={this._openDetailsModal}
                    onDelete={this._openDeleteModal}
                    onDisassociate={!!space ? k => this._disassociateSpace(space, k) : null}
                />
            </div>
        );
    }

    private _renderDetailsView() {
        const { keyId } = this.context.router.route.match.params;
        const selectedKeyId = parseInt(keyId, 10);
        const selectedKeyInfo = this.state.keys.find(k => k.id === selectedKeyId);
        const selectedKey = selectedKeyInfo.key;

        return (
            <KeyDetailContainer
                selectedKeyInfo={selectedKeyInfo}
                goBack={this._closeModals}
                serialInUseUpdated={this._serialInUseUpdated}
                serialTotalUpdated={this._serialTotalUpdated}
                spacesTotalUpdated={this._spacesTotalUpdated}
                openEditModal={this._openEditModal}
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
        let keyInfo: IKeyInfo = {
            id: key.id,
            key,
            serialsInUseCount: 0,
            serialsTotalCount: 0,
            spacesCount: 0
        };
        if (index !== -1) {
            // update already existing entry in key
            const updateKeys = [...this.state.keys];
            updateKeys[index].key = key;
            keyInfo = updateKeys[index];

            this.setState({
                ...this.state,
                keys: updateKeys
            });
        } else {
            this.setState({
                keys: [...this.state.keys, keyInfo]
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

        return keyInfo;
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

        const updateUrl = `/api/${this.context.team.slug}/keys/update/${key.id}`;
        key = await this.context.fetch(updateUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        // update already existing entry in key
        const updateKey = [...this.state.keys];
        updateKey[index].key = key;

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

    private _deleteKey = async (key: IKey) => {
        if (!confirm("Are you should you want to delete item?")) {
            return false;
        }
        const deleted: IKey = await this.context.fetch(
            `/api/${this.context.team.slug}/keys/delete/${key.id}`,
            {
                method: "POST"
            }
        );

        // remove from state
        const index = this.state.keys.findIndex(x => x.id === key.id);
        if (index > -1) {
            const shallowCopy = [...this.state.keys];
            shallowCopy.splice(index, 1);
            this.setState({ keys: shallowCopy });
        }
    };

    private _associateSpace = async (space: ISpace, keyInfo: IKeyInfo) => {
        const { team } = this.context;
        const { keys } = this.state;

        // possibly create key
        if (keyInfo.id === 0) {
            keyInfo = await this._createKey(keyInfo.key);
        }

        const request = {
            spaceId: space.id
        };

        const associateUrl = `/api/${team.slug}/keys/associateSpace/${keyInfo.id}`;
        const association = await this.context.fetch(associateUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        // update count here
        keyInfo.spacesCount++;

        const index = this.state.keys.findIndex(x => x.id === keyInfo.id);
        if (index !== -1) {
            // update already existing entry in key
            const updateKeys = [...this.state.keys];
            updateKeys[index] = keyInfo;

            this.setState({
                ...this.state,
                keys: updateKeys
            });
        } else {
            this.setState({
                keys: [...this.state.keys, keyInfo]
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
    };

    private _disassociateSpace = async (space: ISpace, keyInfo: IKeyInfo) => {
        const { team } = this.context;
        const { keys } = this.state;

        const request = {
            spaceId: space.id
        };

        const disassociateUrl = `/api/${team.slug}/keys/disassociateSpace/${keyInfo.id}`;
        const result = await this.context.fetch(disassociateUrl, {
            body: JSON.stringify(request),
            method: "POST"
        });

        // update count here
        keyInfo.spacesCount--;

        const updatedKeys = [...keys];
        const index = updatedKeys.findIndex(k => k.id === keyInfo.id);
        updatedKeys.splice(index, 1);

        this.setState({
            keys: updatedKeys
        });

        if (this.props.assetTotalUpdated) {
            this.props.assetTotalUpdated(
                "key",
                this.props.space ? this.props.space.id : null,
                this.props.person ? this.props.person.id : null,
                -1
            );
        }
    };

    // managing counts for assigned or revoked
    private _serialInUseUpdated = (keyId: number, count: number) => {
        const index = this.state.keys.findIndex(x => x.id === keyId);
        if (index > -1) {
            const keys = [...this.state.keys];
            keys[index].serialsInUseCount += count;

            this.setState({ keys });
        }
    };
    private _serialTotalUpdated = (keyId: number, count: number) => {
        const index = this.state.keys.findIndex(x => x.id === keyId);
        if (index > -1) {
            const keys = [...this.state.keys];
            keys[index].serialsTotalCount += count;

            this.setState({ keys });
        }
    };

    private _spacesTotalUpdated = (keyId: number, count: number) => {
        const index = this.state.keys.findIndex(x => x.id === keyId);
        if (index > -1) {
            const keys = [...this.state.keys];
            keys[index].spacesCount += count;

            this.setState({ keys });
        }
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
        this.context.router.history.push(`/${team.slug}/keys/details/${key.id}`);
    };

    private _openEditModal = (key: IKey) => {
        const { team } = this.context;
        this.context.router.history.push(`/${team.slug}/keys/edit/${key.id}`);
    };

    private _openDeleteModal = (equipment: IKey) => {
        this.context.router.history.push(`${this._getBaseUrl()}/keys/delete/${equipment.id}`);
    };

    private _openAssociate = () => {
        this.context.router.history.push(`${this._getBaseUrl()}/keys/associate`);
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
