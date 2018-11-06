import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import { IKeySerial } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import KeySerialEditValues from "./KeySerialEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedKeySerial: IKeySerial;
}


export default class KeyDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedKeySerial == null)
        {
            return null;
        }

        const keySerial = this.props.selectedKeySerial;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="keys-color">

                  <div className="modal-header row justify-content-between">
                    <h2>Details for {keySerial.number}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>
                    <ModalBody>
                        <KeySerialEditValues selectedKeySerial={keySerial} disableEditing={true} />
                        <HistoryContainer controller="keys" id={keySerial.id} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
