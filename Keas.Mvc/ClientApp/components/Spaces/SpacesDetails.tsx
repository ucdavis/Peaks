import PropTypes from "prop-types";
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
    selectedSpace: ISpace;
    workstationAssigned: (id: number, created: boolean, assigned: boolean) => void;
    workstationRevoked: (id: number) => void;
    workstationEdited: (id: number) => void;
    tags: string[];
}

export default class SpacesDetails extends React.Component<IProps, {}> {
    public render() {
        if (!this.props.selectedSpace)
        {
            return null;
        }
        return (
            <div>
                <br />

                <div>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>
                </div>
                <hr />
                <h5>Details for {this.props.selectedSpace.roomNumber} {this.props.selectedSpace.bldgName}</h5>
                <div>
                    {this.props.selectedSpace.roomName &&
                        <div className="form-group">
                        <h5>Room Name</h5>
                        {this.props.selectedSpace.roomName}
                        </div>}
                    <SpacesDetailsKeys spaceId={this.props.selectedSpace.id} />
                    <SpacesDetailsEquipment spaceId={this.props.selectedSpace.id} />
                    <WorkstationContainer 
                        spaceId={this.props.selectedSpace.id} 
                        tags={this.props.tags}
                        workstationAssigned={this.props.workstationAssigned}
                        workstationEdited={this.props.workstationEdited}
                        workstationRevoked={this.props.workstationRevoked}
                    />
                </div>
                <hr/>
                <div>
                    <Button color="secondary" onClick={this.props.closeModal}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>
                </div>
            </div>
        );
    }

    
}
