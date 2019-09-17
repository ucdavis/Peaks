import * as PropTypes from "prop-types";
import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { AppContext, IKeyInfo, ISpace } from "../../Types";
import SearchSpaces from "../Spaces/SearchSpaces";
import KeyEditValues from "./KeyEditValues";
import SearchKeys from "./SearchKeys";

interface IProps {
    onDisassociate?: (key: IKeyInfo) => void;
    closeModal: () => void;

    isModalOpen: boolean;
    selectedKeyInfo?: IKeyInfo;
    selectedSpace?: ISpace;
}

interface IState {
    error: string;
    submitting: boolean;
    validState: boolean;
}

export default class DisassociateSpace extends React.Component<IProps, IState> {
   
    constructor(props: IProps) {
        super(props);

        this.state = {
            error: "",
            submitting: false,
            validState: false
        };
    }

    public render() {
        const className = this.props.selectedKeyInfo ? "" : "keys-anomaly"; // purple on keys/details
        return <div>{this.renderModal()}</div>;
    }

    private renderModal() {
        const { isModalOpen, selectedKeyInfo, selectedSpace } = this.props;
        const { validState, submitting } = this.state;

        return (
            <Modal isOpen={isModalOpen} toggle={this._closeModal} size="lg" className="keys-color">
                <div className="modal-header row justify-content-between">
                    <h2>Disassociate</h2>
                    <Button color="link" onClick={this._closeModal}>
                        <i className="fas fa-times fa-lg" />
                    </Button>
                </div>
                <ModalBody>
                    are you sure you want to disassociate .....
                </ModalBody>
                <ModalFooter className="justify-content-between">
                    <span className="text-danger">{this.state.error}</span>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.props.onDisassociate(this.props.selectedKeyInfo);
                            this._closeModal();
                        }}
                        disabled={submitting}
                    >
                        Disassociate
                        {submitting && <i className="fas fa-circle-notch fa-spin ml-2" />}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    // default everything out on close
    private _closeModal = () => {
        const { selectedKeyInfo, selectedSpace } = this.props;

        this.setState({
            error: "",
            submitting: false,
            validState: false
        });

        this.props.closeModal();
    };

    // assign the selected key even if we have to create it
}
