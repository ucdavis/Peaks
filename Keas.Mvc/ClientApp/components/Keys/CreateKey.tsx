import * as PropTypes from "prop-types";
import * as React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IKey } from "../../Types";
import KeyEditValues from "./KeyEditValues";

interface IProps {
    onCreate: (key: IKey) => void;
    modal: boolean;
    onOpenModal: () => void;
    closeModal: () => void;
    searchableTags: string[];
    checkIfKeyCodeIsValid: (code: string) => boolean;
}

interface IState {
    error: string;
    key: IKey;
    submitting: boolean;
    validState: boolean;
}

export default class CreateKey extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };

    public context: AppContext;

    private _formRef: React.RefObject<HTMLFormElement>;

    constructor(props: IProps) {
        super(props);

        this._formRef = React.createRef();

        this.state = {
            error: "",
            key: {
                code: "",
                id: 0,
                name: "",
                notes: "",
                serials: [],
                tags: "",
                teamId: 0
            },
            submitting: false,
            validState: false
        };
    }

    public render() {
        return (
            <div>
                <Button color="link" onClick={this.props.onOpenModal}>
                    <i className="fas fa-plus fa-sm" aria-hidden="true" /> Add Key
                </Button>
                {this.renderModal()}
            </div>
        );
    }

    private renderModal() {
        const { searchableTags } = this.props;

        return (
            <Modal
                isOpen={this.props.modal}
                toggle={this._closeModal}
                size="lg"
                className="keys-color"
            >
                <div className="modal-header row justify-content-between">
                    <h2>Create Key</h2>
                    <Button color="link" onClick={this._closeModal}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>
                <ModalBody>
                    <form ref={this._formRef}>
                        <KeyEditValues
                            selectedKey={this.state.key}
                            changeProperty={this._changeProperty}
                            disableEditing={false}
                            searchableTags={searchableTags}
                        />
                    </form>
                    {this.state.error}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={this._editSelected}
                        disabled={!this.state.validState || this.state.submitting}
                    >
                        Go!
                        {this.state.submitting && (
                            <i className="fas fa-circle-notch fa-spin ml-2" />
                        )}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    private _changeProperty = (property: string, value: string) => {
        this.setState(
            {
                key: {
                    ...this.state.key,
                    [property]: value
                }
            },
            this._validateState
        );
    };

    // clear everything out on close
    private _closeModal = () => {
        this.setState({
            error: "",
            key: {
                code: "",
                id: 0,
                name: "",
                notes: "",
                serials: [],
                tags: "",
                teamId: 0
            },
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
        await this.props.onCreate(this.state.key);

        this._closeModal();
    };

    private _validateState = () => {
        const { key } = this.state;

        let valid = this._formRef.current.checkValidity();
        let error = "";

        if (!key) {
            valid = false;
        } else if (!key.code) {
            valid = false;
            error = "You must give this key a code.";
        } else if (key.code.length > 64) {
            valid = false;
            error = "The code you have chosen is too long";
        } else if (!this.props.checkIfKeyCodeIsValid(key.code)) {
            valid = false;
            error = "The code you have chosen is already in use."
        }

        this.setState({
            error,
            validState: valid
        });
    };
}
