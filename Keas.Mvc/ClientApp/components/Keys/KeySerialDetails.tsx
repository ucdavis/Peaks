import * as PropTypes from 'prop-types';
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
} from "reactstrap";
import { IKeySerial } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import KeySerialEditValues from "./KeySerialEditValues";


interface IProps {
    isModalOpen: boolean;
    closeModal: () => void;
    selectedKeySerial: IKeySerial;
}


export default class KeyDetails extends React.Component<IProps, {}> {

    public render() {
        const { selectedKeySerial } = this.props;

        if (!selectedKeySerial) {
            return null;
        }

        return (
            <div>
                <Modal isOpen={this.props.isModalOpen} toggle={this.props.closeModal} size="lg" className="keys-color">

                    <div className="modal-header row justify-content-between">
                        <h2>Details for {selectedKeySerial.number}</h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg"/>
                        </Button>
                    </div>
                    <ModalBody>
                        <KeySerialEditValues
                            keySerial={selectedKeySerial}
                            disableEditing={true}
                        />
                        <HistoryContainer controller="keys" id={selectedKeySerial.id} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
