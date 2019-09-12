import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IKeyInfo, ISpace } from "../../Types";
import SearchSpaces from "../Spaces/SearchSpaces";
import KeyEditValues from "./KeyEditValues";
import SearchKeys from "./SearchKeys";

interface IProps {
    onAssign: (space: ISpace, keyInfo: IKeyInfo) => void;
    openModal: () => void;
    closeModal: () => void;

    isModalOpen: boolean;
    searchableTags: string[];

    selectedKeyInfo?: IKeyInfo;
    selectedSpace?: ISpace;
}

interface IState {
    error: string;
    selectedKeyInfo: IKeyInfo;
    selectedSpace: ISpace;
    submitting: boolean;
    validState: boolean;
}

export default class AssociateSpace extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props: IProps) {
        super(props);

        this.state = {
            error: "",
            selectedKeyInfo: this.props.selectedKeyInfo,
            selectedSpace: this.props.selectedSpace,
            submitting: false,
            validState: false
        };
    }

    public componentWillReceiveProps(nextProps: IProps) {
        if (nextProps.selectedKeyInfo !== this.props.selectedKeyInfo) {
            this.setState({ selectedKeyInfo: nextProps.selectedKeyInfo });
        }

        if (nextProps.selectedSpace !== this.props.selectedSpace) {
            this.setState({ selectedSpace: nextProps.selectedSpace });
        }
    }

    public render() {
        const className = this.props.selectedKeyInfo ? "" : "keys-anomaly"; // purple on keys/details
        return (
            <div>
                <Button className={className} color="link" onClick={this.props.openModal}>
                    <i className="fas fa-plus fa-sm mr-2" aria-hidden="true" />
                    Associate
                </Button>
                {this.renderModal()}
            </div>
        );
    }

    private renderModal() {
        const { isModalOpen, selectedKeyInfo, selectedSpace } = this.props;
        const { validState, submitting } = this.state;

        return (
            <Modal isOpen={isModalOpen} toggle={this._closeModal} size="lg" className="keys-color">
                <div className="modal-header row justify-content-between">
                    <h2>Assign Key</h2>
                    <Button color="link" onClick={this._closeModal}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>
                <ModalBody>
                    {this.renderSearchSpace()}

                    {this.renderSearchKey()}

                    {this.renderCreateKey()}
                </ModalBody>
                <ModalFooter className="justify-content-between">
                    <span className="text-danger">{this.state.error}</span>
                    <Button
                        color="primary"
                        onClick={this._assignSelected}
                        disabled={!validState || submitting}
                    >
                        Go!
                        {submitting && <i className="fas fa-circle-notch fa-spin ml-2" />}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    private renderSearchSpace() {
        const { selectedSpace } = this.props;

        // we're being given a specific key to readonly
        if (selectedSpace) {
            return (
                <div className="form-group">
                    <label>Space to associate with:</label>
                    <input
                        className="form-control"
                        value={`${selectedSpace.roomNumber} ${selectedSpace.bldgName}`}
                        readOnly={true}
                    />
                </div>
            );
        }

        return (
            <div className="form-group">
                <label>Space to associate with:</label>
                <SearchSpaces onSelect={this._onSelectSpace} />
            </div>
        );
    }

    private renderSearchKey() {
        const { selectedKeyInfo } = this.props;

        // we're being given a specific key to readonly
        if (selectedKeyInfo) {
            return (
                <div className="form-group">
                    <label>Key to associate with:</label>
                    <input
                        className="form-control"
                        value={`${selectedKeyInfo.key.name} - ${selectedKeyInfo.key.code}`}
                        readOnly={true}
                    />
                </div>
            );
        }

        return (
            <div className="form-group">
                <label>Pick an key to associate</label>
                <SearchKeys
                    onSelect={this._onSelectedKeyInfo}
                    onDeselect={this._onDeselected}
                    allowNew={false}
                />
            </div>
        );
    }

    private renderCreateKey() {
        const { searchableTags } = this.props;
        const { selectedKeyInfo } = this.state;

        if (!selectedKeyInfo || selectedKeyInfo.id > 0) {
            return;
        }

        return (
            <KeyEditValues
                selectedKey={selectedKeyInfo.key}
                changeProperty={this._changeProperty}
                disableEditing={false}
                searchableTags={searchableTags}
            />
        );
    }

    private _changeProperty = (property: string, value: string) => {
        this.setState(
            {
                selectedKeyInfo: {
                    ...this.state.selectedKeyInfo,
                    key: {
                        ...this.state.selectedKeyInfo.key,
                        [property]: value
                    }
                }
            },
            this._validateState
        );
    };

    // default everything out on close
    private _closeModal = () => {
        const { selectedKeyInfo, selectedSpace } = this.props;

        this.setState({
            error: "",
            selectedKeyInfo,
            selectedSpace,
            submitting: false,
            validState: false
        });

        this.props.closeModal();
    };

    // assign the selected key even if we have to create it
    private _assignSelected = async () => {
        const { selectedSpace, selectedKeyInfo } = this.state;

        if (!this.state.validState || this.state.submitting) {
            return;
        }

        this.setState({ submitting: true });

        try {
            await this.props.onAssign(selectedSpace, selectedKeyInfo);
        } catch (err) {
            this.setState({ submitting: false });
            return;
        }
        this._closeModal();
    };

    private _onSelectedKeyInfo = (keyInfo: IKeyInfo) => {
        this.setState({ selectedKeyInfo: keyInfo, error: "" }, this._validateState);
    };

    private _onDeselected = () => {
        this.setState({ selectedKeyInfo: null, error: "" }, this._validateState);
    };

    private _onSelectSpace = (space: ISpace) => {
        this.setState({ selectedSpace: space }, this._validateState);
    };

    private _validateState = () => {
        const { selectedSpace, selectedKeyInfo } = this.state;

        let valid = true;
        let error = "";

        // ensure both values are set
        if (!this.state.selectedKeyInfo) {
            valid = false;
        } else if (this.state.error !== "") {
            valid = false;
        }

        // check for existing association
        if (selectedKeyInfo.key.keyXSpaces && selectedKeyInfo.key.keyXSpaces.length) {
            const isDuplicate = selectedKeyInfo.key.keyXSpaces.some(
                x => x.spaceId === selectedSpace.id
            );
            if (isDuplicate) {
                valid = false;
                error = "This space and key are already associated.";
            }
        }

        this.setState({ validState: valid, error });
    };
}
