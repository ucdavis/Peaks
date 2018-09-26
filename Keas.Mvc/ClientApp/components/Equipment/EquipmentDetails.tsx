import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { IEquipment } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import EquipmentEditValues from "./EquipmentEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedEquipment: IEquipment;
}


export default class EquipmentDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedEquipment == null)
        {
            return null;
        }
        const equipment = this.props.selectedEquipment;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="equipment-color">
                  <div className="modal-header row justify-content-between">
                    <h2>Details for {equipment.name}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>

                    <ModalBody>
                        <EquipmentEditValues selectedEquipment={equipment} disableEditing={true} />
                        <HistoryContainer controller="equipment" id={equipment.id}/>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
