import * as PropTypes from 'prop-types';
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import { IKey } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import KeyEditValues from "./KeyEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedKey: IKey;
}


export default class KeyDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedKey == null)
        {
            return null;
        }
        const key = this.props.selectedKey;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="keys-color">

                  <div className="modal-header row justify-content-between">
                    <h2>Details for {key.name}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>
                    <ModalBody>
                        <KeyEditValues selectedKey={key} disableEditing={true} />
                        <HistoryContainer controller="keys" id={key.id} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
