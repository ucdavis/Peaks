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

interface IProps {
    goBack: () => void;
    selectedPerson: IPerson;
    tags: string[];
    assignedOrCreated: (type: string, spaceId: number, personId: number, created: boolean, assigned: boolean) => void;
    revokedOrDeleted: (type: string, spaceId: number, personId: number) => void;
    edited?: (type: string, spaceId: number, personId: number) => void;
}


export default class PersonDetails extends React.Component<IProps, {}> {

    public render() {
        if (this.props.selectedPerson == null) 
        {
            return null;
        }
        return (
            <div>
                <br />
                <div>
                    <Button color="secondary" onClick={this.props.goBack}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>
                </div>
                <hr />
                <h5>Details for {this.props.selectedPerson.user.name} </h5>
                <div>
                        <BioContainer person={this.props.selectedPerson} />
                        <KeyContainer person={this.props.selectedPerson} />
                        <EquipmentContainer person={this.props.selectedPerson} />
                        <AccessContainer person={this.props.selectedPerson} 
                            accessAssigned={this.props.assignedOrCreated}
                            accessRevoked={this.props.revokedOrDeleted}
                            accessEdited={this.props.edited}/>
                        />
                        <WorkstationContainer 
                            person={this.props.selectedPerson} 
                            tags={this.props.tags}
                            workstationAssigned={this.props.assignedOrCreated}
                            workstationRevoked={this.props.revokedOrDeleted}
                            workstationEdited={this.props.edited}/>
                        <HistoryContainer controller="people" id={this.props.selectedPerson.id} />
                </div>
                <hr/>
                <div>
                    <Button color="secondary" onClick={this.props.goBack}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>
                </div>
            </div>
        );
    }
}
