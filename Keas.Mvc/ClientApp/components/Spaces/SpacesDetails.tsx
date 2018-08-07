﻿import PropTypes from "prop-types";
import * as React from "react";
import { NavLink, Redirect } from "react-router-dom";
import {
    Button,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { AppContext, ISpace } from "../../Types";
import WorkstationContainer from "../Workstations/WorkstationContainer";
import SpacesDetailsEquipment from "./SpacesDetailsEquipment";
import SpacesDetailsKeys from "./SpacesDetailsKeys";


interface IProps {
    closeModal: () => void;
    modal: boolean;
    selectedSpace: ISpace;
}

export default class SpacesDetails extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedSpace)
        {
            return null;
        }
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.props.closeModal} size="lg">
                    <ModalHeader>Details for {this.props.selectedSpace.roomNumber} {this.props.selectedSpace.bldgName}</ModalHeader>
                    <ModalBody>
                        {this.props.selectedSpace.roomName &&
                            <div className="form-group">
                            <h5>Room Name</h5>
                            {this.props.selectedSpace.roomName}
                            </div>}
                        <SpacesDetailsKeys spaceId={this.props.selectedSpace.id} />
                        <SpacesDetailsEquipment spaceId={this.props.selectedSpace.id} />
                        <WorkstationContainer spaceId={this.props.selectedSpace.id} />
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
