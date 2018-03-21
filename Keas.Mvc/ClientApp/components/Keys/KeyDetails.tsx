import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ListGroup,
    ListGroupItem
} from "reactstrap";
import { IKey } from "ClientApp/Types";
import KeyEditValues from "./KeyEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedKey: IKey;
}


export default class KeyDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedKey == null)
            return null;
        const key = this.props.selectedKey;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg">
                    <ModalHeader>Details for {key.name}</ModalHeader>
                    <ModalBody>
                        <KeyEditValues selectedKey={key} disableEditing={true} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.closeModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
