import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { IPerson } from "../../Types";
import Person from "../Person";
import EquipmentEditValues from "./EquipmentEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedPerson: IPerson;
}


export default class PersonDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedPerson == null) 
        {
            return null;
        }
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg">
                    <ModalHeader>Details for {this.props.selectedPerson.user.name}</ModalHeader>
                    <ModalBody>
                        <Person person={this.props.selectedPerson}/>
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
