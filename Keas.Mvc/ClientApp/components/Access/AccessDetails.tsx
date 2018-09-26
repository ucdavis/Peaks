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
import { IAccess } from "ClientApp/Types";
import AccessEditValues from "./AccessEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedAccess: IAccess;
}


export default class AccessDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedAccess == null)
            return null;
        const access = this.props.selectedAccess;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="access-color">
                  <div className="modal-header row justify-content-between">
                    <h2>Details for {access.name}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>

                    <ModalBody>
                        <AccessEditValues selectedAccess={access} disableEditing={true} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
