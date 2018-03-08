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
import { IEquipment } from "ClientApp/Types";
import EquipmentViewValues from "./EquipmentViewValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedEquipment: IEquipment;
}


export default class EquipmentDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedEquipment == null)
            return null;
        const equipment = this.props.selectedEquipment;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg">
                    <ModalHeader>Details for {equipment.name}</ModalHeader>
                    <ModalBody>
                        <EquipmentViewValues selectedEquipment={equipment} />
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
