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
import AccessContainer from "../Access/AccessContainer";
import BioContainer from "../Biographical/BioContainer";
import EquipmentContainer from "../Equipment/EquipmentContainer";
import HistoryContainer from "../History/HistoryContainer";
import KeyContainer from "../Keys/KeyContainer";
import WorkstationContainer from "../Workstations/WorkstationContainer";
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
                        <BioContainer person={this.props.selectedPerson} />
                        <KeyContainer person={this.props.selectedPerson} />
                        <EquipmentContainer person={this.props.selectedPerson} />
                        <AccessContainer person={this.props.selectedPerson} />
                        <WorkstationContainer personId={this.props.selectedPerson.id} />
                        <HistoryContainer controller="people" id={this.props.selectedPerson.id} />
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
