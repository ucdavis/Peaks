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
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-4"><label>Name</label></div>
                                <div className="col-md-4">{equipment.name}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-4"><label>Serial Number</label></div>
                                <div className="col-md-4">{equipment.serialNumber}</div>
                            </div>
                            {equipment.assignment != null &&
                                <div className="row">
                                    <div className="col-md-4"><label>Expires at</label></div>
                                    <div className="col-md-4">{equipment.assignment.expiresAt}</div>
                                </div>
                            }
                            <div className="row">
                                <div className="col-md-4"><label>Make</label></div>
                                <div className="col-md-4">{equipment.make}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-4"><label>Model</label></div>
                                <div className="col-md-4">{equipment.model}</div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.toggleModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
