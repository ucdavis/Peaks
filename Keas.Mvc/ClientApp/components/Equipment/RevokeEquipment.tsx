import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IEquipment } from "../../Types";
import EquipmentAssignmentValues from "./EquipmentAssignmentValues";
import EquipmentEditValues from "./EquipmentEditValues";

interface IProps {
    modal: boolean;
    closeModal: () => void;
    openEditModal: (equipment: IEquipment) => void;
    openUpdateModal: (equipment: IEquipment) => void;
    revokeEquipment: (equipment: IEquipment) => void;
    selectedEquipment: IEquipment;
}

interface IState {
    submitting: boolean;
}

export default class RevokeEquipment extends React.Component<IProps, IState> {
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
        if (!this.props.selectedEquipment || !this.props.selectedEquipment.assignment) {
            return null;
        }
        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this.props.closeModal}
                    size="lg"
                    className="equipment-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>Revoke {this.props.selectedEquipment.name}</h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>

                    <ModalBody>
                        <EquipmentEditValues
                            selectedEquipment={this.props.selectedEquipment}
                            disableEditing={true}
                            openEditModal={this.props.openEditModal}
                        />
                        <EquipmentAssignmentValues
                            selectedEquipment={this.props.selectedEquipment}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                        {!this._isValidToRevoke() && (
                            <div>The equipment you have chosen does not have an assignment</div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={() => this._revokeEquipment()}
                            disabled={!this._isValidToRevoke() || this.state.submitting}
                        >
                            Go!{" "}
                            {this.state.submitting && <i className="fas fa-circle-notch fa-spin" />}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _revokeEquipment = async () => {
        if (!this._isValidToRevoke()) {
            return;
        }
        this.setState({ submitting: true });
        await this.props.revokeEquipment(this.props.selectedEquipment);
        this.setState({ submitting: false });
        this.props.closeModal();
    };

    private _isValidToRevoke = () => {
        return this.props.selectedEquipment.assignment !== null;
    };
}
