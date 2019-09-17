import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IKeySerial } from "../../Types";
import KeySerialAssignmentValues from "./KeySerialAssignmentValues";
import KeySerialEditValues from "./KeySerialEditValues";
import { toast } from "react-toastify";

interface IProps {
    isModalOpen: boolean;
    closeModal: () => void;
    openEditModal: (keySerial: IKeySerial) => void;
    openUpdateModal: (keySerial: IKeySerial) => void;
    onRevoke: (keySerial: IKeySerial) => void;
    selectedKeySerial: IKeySerial;
    updateSelectedKeySerial: (keySerial: IKeySerial) => void;

}

interface IState {
    submitting: boolean;
}

export default class RevokeKeySerials extends React.Component<IProps, IState> {
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

    public componentDidMount() {
        if (!this.props.selectedKeySerial) {
            return;
        }
        this._fetchDetails(this.props.selectedKeySerial.id);
    }

    
    // make sure we change the key we are updating if the parent changes selected key
    public componentWillReceiveProps(nextProps: IProps) {
        if (
            nextProps.selectedKeySerial &&
            (!this.props.selectedKeySerial ||
                nextProps.selectedKeySerial.id !== this.props.selectedKeySerial.id)
        ) {
            this._fetchDetails(nextProps.selectedKeySerial.id);
        }
    }

    public render() {
        const { selectedKeySerial } = this.props;

        if (!selectedKeySerial) {
            return null;
        }
        return (
            <div>
                <Modal
                    isOpen={this.props.isModalOpen}
                    toggle={this.props.closeModal}
                    size="lg"
                    className="keys-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>
                            Revoke for {selectedKeySerial.key.code} {selectedKeySerial.number}
                        </h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>
                    <ModalBody>
                        <KeySerialEditValues
                            keySerial={selectedKeySerial}
                            disableEditing={true}
                            openEditModal={this.props.openEditModal}
                        />
                        <KeySerialAssignmentValues
                            selectedKeySerial={selectedKeySerial}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={() => this._revokeEquipment()}
                            disabled={!this._isValidToRevoke() || this.state.submitting}
                        >
                            Revoke{" "}
                            {this.state.submitting && <i className="fas fa-circle-notch fa-spin" />}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private _fetchDetails = async (id: number) => {
        const url = `/api/${this.context.team.slug}/keySerials/details/${id}`;
        let keySerial: IKeySerial = null;
        try {
            keySerial = await this.context.fetch(url);
        } catch (err) {
            toast.error("Error fetching key serial details. Please refresh to try again.");
        }
        this.props.updateSelectedKeySerial(keySerial);
    };

     private _revokeEquipment = async () => {
        if (!this._isValidToRevoke()) {
            return;
        }
        this.setState({ submitting: true });
        await this.props.onRevoke(this.props.selectedKeySerial);
        this.setState({ submitting: false });
        this.props.closeModal();
    };

    private _isValidToRevoke = () => {
        return this.props.selectedKeySerial !== null;
    };
}
