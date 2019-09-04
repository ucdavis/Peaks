import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IKeySerial } from "../../Types";
import KeySerialAssignmentValues from "./KeySerialAssignmentValues";
import KeySerialEditValues from "./KeySerialEditValues";

interface IProps {
    onEdit: (keySerial: IKeySerial) => void;
    isModalOpen: boolean;
    closeModal: () => void;
    openUpdateModal: (keySerial: IKeySerial) => void;
    selectedKeySerial: IKeySerial;
    statusList: string[];
}

interface IState {
    error: string;
    keySerial: IKeySerial;
    submitting: boolean;
    validState: boolean;
}

export default class EditKeySerial extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };

    public context: AppContext;

    constructor(props: IProps) {
        super(props);
        this.state = {
            error: "",
            keySerial: this.props.selectedKeySerial,
            submitting: false,
            validState: false
        };
    }

    // make sure we change the key we are updating if the parent changes selected key
    public componentWillReceiveProps(nextProps: IProps) {
        if (nextProps.selectedKeySerial !== this.props.selectedKeySerial) {
            this.setState({ keySerial: nextProps.selectedKeySerial });
        }
    }

    public render() {
        if (!this.state.keySerial) {
            return null;
        }

        return (
            <Modal
                isOpen={this.props.isModalOpen}
                toggle={this._confirmClose}
                size="lg"
                className="keys-color"
            >
                <div className="modal-header row justify-content-between">
                    <h2>
                        Edit Serial {this.props.selectedKeySerial.key.code}{" "}
                        {this.props.selectedKeySerial.number}
                    </h2>
                    <Button color="link" onClick={this._closeModal}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>
                <ModalBody>
                    <div className="container-fluid">
                        <form>
                            <KeySerialEditValues
                                keySerial={this.state.keySerial}
                                changeProperty={this._changeProperty}
                                disableEditing={false}
                                statusList={this.props.statusList}
                            />
                          
                            <KeySerialAssignmentValues
                                selectedKeySerial={this.props.selectedKeySerial}
                                openUpdateModal={this.props.openUpdateModal}
                            />
                        </form>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={this._editSelected}
                        disabled={!this.state.validState || this.state.submitting}
                    >
                        Go! {this.state.submitting && <i className="fas fa-circle-notch fa-spin" />}
                    </Button>{" "}
                </ModalFooter>
            </Modal>
        );
    }

    private _changeProperty = (property: string, value: string) => {
        this.setState(
            {
                keySerial: {
                    ...this.state.keySerial,
                    [property]: value
                }
            },
            this._validateState
        );
    };

    // clear everything out on close
    private _confirmClose = () => {
        if (!confirm("Please confirm you want to close!")) {
            return;
        }

        this._closeModal();
    };

    private _closeModal = () => {
        this.setState({
            error: "",
            keySerial: null,
            submitting: false,
            validState: false
        });
        this.props.closeModal();
    };

    // assign the selected key even if we have to create it
    private _editSelected = async () => {
        if (!this.state.validState || this.state.submitting) {
            return;
        }

        this.setState({ submitting: true });
        await this.props.onEdit(this.state.keySerial);

        this._closeModal();
    };

    private _validateState = () => {
        let valid = true;
        let error = "";

        if (!this.state.keySerial) {
            valid = false;
        } else if (!this.state.keySerial.number) {
            valid = false;
            error = "You must give this key a name.";
        } else if (this.state.keySerial.number.length > 64) {
            valid = false;
            error = "The name you have chosen is too long";
        }

        this.setState({ validState: valid, error });
    };
}
