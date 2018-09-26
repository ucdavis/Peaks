import PropTypes from "prop-types";
import * as React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { IWorkstation } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import WorkstationEditValues from "./WorkstationEditValues";


interface IProps {
    modal: boolean;
    closeModal: () => void;
    selectedWorkstation: IWorkstation;
}


export default class WorkstationDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedWorkstation == null)
        {
            return null;
        }
        const workstation = this.props.selectedWorkstation;
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg" className="spaces-color">
                  <div className="modal-header row justify-content-between">
                    <h2>Details for {workstation.name}</h2>
                    <Button color="link" onClick={this.props.closeModal}>
                    <i className="fas fa-times fa-lg"/>
                    </Button>
                  </div>
                    <ModalBody>
                        <WorkstationEditValues selectedWorkstation={workstation} disableEditing={true} />
                        <HistoryContainer controller="workstations" id={workstation.id}/>
                    </ModalBody>

                </Modal>
            </div>
        );
    }
}
