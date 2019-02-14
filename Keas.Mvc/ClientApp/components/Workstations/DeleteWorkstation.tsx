import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IWorkstation } from "../../Types";
import WorkstationEditValues from "./WorkstationEditValues";

interface IProps {
    modal: boolean;
    closeModal: () => void;
    deleteWorkstation: (workstation: IWorkstation) => void;
    selectedWorkstation: IWorkstation;
}

interface IState {
    submitting: boolean;
}

export default class DeleteWorkstation extends React.Component<IProps, IState> {
    public static contextTypes = {
        fetch: PropTypes.func,
        team: PropTypes.object
    };
    public context: AppContext;
    constructor(props) {
        super(props);
        this.state = {
            submitting: false
        };
    }

    public render() {
        if (!this.props.selectedWorkstation) {
            return null;
        }
        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this.props.closeModal}
                    size="lg"
                    className="workstation-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>Delete {this.props.selectedWorkstation.name}</h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>

                    <ModalBody>
                        <WorkstationEditValues
                            selectedWorkstation={this.props.selectedWorkstation}
                            disableEditing={true}
                            disableSpaceEditing={true}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={this._deleteWorkstation}
                            disabled={this.state.submitting}
                        >
                            Go!{" "}
                            {this.state.submitting && <i className="fas fa-circle-notch fa-spin" />}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _deleteWorkstation = async () => {
        if (
            this.props.selectedWorkstation.assignment !== null &&
            !confirm("This workstation is currently assigned, are you sure you want to delete it?")
        ) {
            return;
        }
        this.setState({ submitting: true });
        try {
            await this.props.deleteWorkstation(this.props.selectedWorkstation);
        } catch (err) {
            alert("There was an error deleting this workstation, please try again");
            this.setState({ submitting: false });
            return;
        }
        this.setState({ submitting: false });
        this.props.closeModal();
    };
}
