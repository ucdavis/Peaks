import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import WorkstationAssignmentValues from "./WorkstationAssignmentValues";
import WorkstationEditValues from "./WorkstationEditValues";

interface IProps {
    onEdit: (workstation: IWorkstation) => void;
    modal: boolean;
    closeModal: () => void;
    openUpdateModal: (workstation: IWorkstation) => void;
    selectedWorkstation: IWorkstation;
    tags: string[];
}

interface IState {
    error: string;
    submitting: boolean;
    workstation: IWorkstation;
    validState: boolean;
}

export default class EditWorkstation extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            error: "",
            submitting: false,
            validState: false,
            workstation: this.props.selectedWorkstation
        };
    }

    // make sure we change the key we are updating if the parent changes selected key
    public componentWillReceiveProps(nextProps) {
        if (nextProps.selectedWorkstation !== this.props.selectedWorkstation) {
            this.setState({ workstation: nextProps.selectedWorkstation });
        }
    }

    public render() {
        if (!this.state.workstation) {
            return null;
        }
        return (
            <Modal
                isOpen={this.props.modal}
                toggle={this._closeModal}
                size="lg"
                className="spaces-color"
            >
                <div className="modal-header row justify-content-between">
                    <h2>Edit Workstation</h2>
                    <Button color="link" onClick={this._closeModalUsingIcon}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>
                <ModalBody>
                    <div className="container-fluid">
                        <form>
                            <WorkstationEditValues
                                selectedWorkstation={this.state.workstation}
                                changeProperty={this._changeProperty}
                                disableEditing={false}
                                tags={this.props.tags}
                                disableSpaceEditing={true}
                            />
                        </form>
                        <WorkstationAssignmentValues
                            selectedWorkstation={this.props.selectedWorkstation}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                        {this.state.error}
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
                workstation: {
                    ...this.state.workstation,
                    [property]: value
                }
            },
            this._validateState
        );
    };

    // clear everything out on close
    private _closeModal = () => {
        if (!confirm("Please confirm you want to close!")){
            return;
        }
        this.setState({
            error: "",
            submitting: false,
            validState: false,
            workstation: null
        });
        this.props.closeModal();
    };

    private _closeModalUsingIcon = () => {
        this.setState({
            error: "",
            submitting: false,
            validState: false,
            workstation: null
        });
        this.props.closeModal();
    };

    // assign the selected key even if we have to create it
    private _editSelected = async () => {
        if (!this.state.validState || this.state.submitting) {
            return;
        }

        this.setState({ submitting: true });

        await this.props.onEdit(this.state.workstation);

        this._closeModal();
    };

    private _validateState = () => {
        let valid = true;
        let error = "";
        if (
            !this.state.workstation ||
            !this.state.workstation.space ||
            !this.state.workstation.name
        ) {
            valid = false;
        } else if (!this.state.workstation.name) {
            valid = false;
            error = "You must give this workstation a name.";
        } else if (this.state.workstation.name.length > 64) {
            valid = false;
            error = "The name you have chosen is too long";
        }
        this.setState({ validState: valid, error });
    };
}
