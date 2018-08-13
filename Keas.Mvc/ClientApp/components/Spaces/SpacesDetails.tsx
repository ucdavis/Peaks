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
import EquipmentContainer from "../Equipment/EquipmentContainer";
import KeyContainer from "../Keys/KeyContainer";
import WorkstationContainer from "../Workstations/WorkstationContainer";
import SpaceDetailContainer from "./SpaceDetailContainer";

interface IProps {
    closeModal: () => void;
    selectedSpace: ISpace;
    assignedOrCreated: (type: string, spaceId: number, personId: number, created: boolean, assigned: boolean) => void;
    revokedOrDeleted: (type: string, spaceId: number, personId: number) => void;
    edited: (type: string, spaceId: number, personId: number) => void;
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
                <div>
                    {this.props.selectedSpace.roomName &&
                    <SpaceDetailContainer space={this.props.selectedSpace}/>}
                    <KeyContainer spaceId={this.props.selectedSpace.id}
                        keyAssigned={this.props.assignedOrCreated}
                        keyEdited={this.props.edited}
                        keyRevoked={this.props.revokedOrDeleted} />
                    <EquipmentContainer spaceId={this.props.selectedSpace.id} 
                        equipmentAssigned={this.props.assignedOrCreated}
                        equipmentEdited={this.props.edited}
                        equipmentRevoked={this.props.revokedOrDeleted}/>
                    <WorkstationContainer 
                        spaceId={this.props.selectedSpace.id} 
                        tags={this.props.tags}
                        workstationAssigned={this.props.assignedOrCreated}
                        workstationEdited={this.props.edited}
                        workstationRevoked={this.props.revokedOrDeleted}
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
