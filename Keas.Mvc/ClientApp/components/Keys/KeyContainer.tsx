import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IKey, IPerson } from "../../Types";

import AssignKey from "./AssignKey";
import KeyList from "./KeyList";
import KeyDetails from "./KeyDetails";

interface IState {
    loading: boolean;
    //either key assigned to this person, or all team keys
    keys: IKey[];
    selectedKey: IKey;
    assignModal: boolean;
    detailsModal: boolean;
}

export default class KeyContainer extends React.Component<{}, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        person: PropTypes.object,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);

        this.state = {
            keys: [],
            selectedKey: null,
            loading: true,
            assignModal: false,
            detailsModal: false,
        };
    }
    public async componentDidMount() {
        // are we getting the person's key or the team's?
        const keyFetchUrl = this.context.person
            ? `/keys/listassigned?personid=${this.context.person.id}&teamId=${this.context.person.teamId}`
            : `/keys/list/${this.context.team.id}`;

        const keys = await this.context.fetch(keyFetchUrl);
        this.setState({ keys, loading: false });
    }
    public render() {
        if (this.state.loading) {
            return <h2>Loading...</h2>;
        }
        const assignedKeyList = this.context.person ? this.state.keys.map(x => x.name) : null;
        const allKeyList = this.context.person ? null : this.state.keys;
        return (
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">Key</h4>
                    <KeyList keys={this.state.keys} onRevoke={this._revokeKey} onAdd={this._assignSelectedKey} showDetails={this._openDetailsModal} />
                    <AssignKey
                        onCreate={this._createAndMaybeAssignKey}
                        modal={this.state.assignModal}
                        openModal={this._openAssignModal}
                        closeModal={this._closeAssignModal}
                        selectedKey={this.state.selectedKey}
                        selectKey={this._selectKey}
                        changeProperty={this._changeSelectedKeyProperty}
                    />
                    <KeyDetails selectedKey={this.state.selectedKey} modal={this.state.detailsModal} closeModal={this._closeDetailsModal} />
                </div>
            </div>
        );
    }
    private _createAndMaybeAssignKey = async (person: IPerson, date: any) => {
        // call API to create a key, then assign it if there is a person to assign to
        var key = this.state.selectedKey;
        //if we are creating a new key
        if (key.id === 0) {
            key.teamId = this.context.team.id;
            key = await this.context.fetch("/keys/create", {
                body: JSON.stringify(key),
                method: "POST"
            });
        }


        // if we know who to assign it to, do it now
        if (person) {
            const assignUrl = `/keys/assign?keyId=${key.id}&personId=${person.id}&date=${date}`;

            key = await this.context.fetch(assignUrl, {
                method: "POST"
            });
        }

        let index = this.state.keys.findIndex(x => x.id == key.id);
        console.log("index " + index);
        if (index !== -1) {
            console.log("changing");
            //update already existing entry in key
            let updateKey = [...this.state.keys];
            updateKey[index] = key;

            this.setState({
                ...this.state,
                keys: updateKey,
            });
        }
        else {
            this.setState({
                keys: [...this.state.keys, key]
            });
        }
    };

    private _revokeKey = async (key: IKey) => {

        // call API to actually revoke
        const removed: IKey = await this.context.fetch("/keys/revoke", {
            body: JSON.stringify(key),
            method: "POST"
        });

        //remove from state
        const index = this.state.keys.indexOf(key);
        if (index > -1) {
            let shallowCopy = [...this.state.keys];
            if (this.context.person == null) {
                //if we are looking at all key, just update assignment
                shallowCopy[index] = removed;
            }
            else {
                //if we are looking at a person, remove from our list of key
                shallowCopy.splice(index, 1);
            }
            this.setState({ keys: shallowCopy });
        }
    }

    //pulls up assign modal from dropdown action
    private _assignSelectedKey = (key: IKey) => {
        this.setState({ selectedKey: key });
        this._openAssignModal();
    }

    private _openAssignModal = async () => {
        this.setState({ assignModal: true });
    };

    //clear everything out on close
    private _closeAssignModal = () => {
        this.setState({
            assignModal: false,
            selectedKey: null,
        });
    };

    //used in assign key 
    private _selectKey = (key: IKey) => {
        this.setState({ selectedKey: key });
    }

    private _changeSelectedKeyProperty = (property: string, value: string) => {
        this.setState({
            selectedKey: {
                ...this.state.selectedKey,
                [property]: value
            }
        });
    }

    private _openDetailsModal = (key: IKey) => {
        this.setState({ detailsModal: true, selectedKey: key });
    }
    private _closeDetailsModal = () => {
        this.setState({ detailsModal: !this.state.detailsModal, selectedKey: null });
    }

}
