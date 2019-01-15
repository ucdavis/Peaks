import * as React from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import { IWorkstation } from "../../Types";
import HistoryContainer from "../History/HistoryContainer";
import WorkstationAssignmentValues from "./WorkstationAssignmentValues";
import WorkstationEditValues from "./WorkstationEditValues";

interface IProps {
    modal: boolean;
    closeModal: () => void;
    openEditModal: (workstation: IWorkstation) => void;
    openUpdateModal: (workstation: IWorkstation) => void;
    selectedWorkstation: IWorkstation;
}

export default class WorkstationDetails extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedWorkstation) {
            return null;
        }
        const workstation = this.props.selectedWorkstation;
        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this.props.closeModal}
                    size="lg"
                    className="spaces-color"
                >
                    <div className="modal-header row justify-content-between">
                        <h2>Details for {workstation.name}</h2>
                        <Button color="link" onClick={this.props.closeModal}>
                            <i className="fas fa-times fa-lg" />
                        </Button>
                    </div>
                    <ModalBody>
                        <WorkstationEditValues
                            selectedWorkstation={workstation}
                            disableEditing={true}
                            openEditModal={this.props.openEditModal}
                        />
                        <WorkstationAssignmentValues
                            selectedWorkstation={workstation}
                            openUpdateModal={this.props.openUpdateModal}
                        />
                        <HistoryContainer controller="workstations" id={workstation.id} />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
