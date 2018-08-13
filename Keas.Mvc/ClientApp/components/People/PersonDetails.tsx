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
    inUseUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
    totalUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
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
                <div>
                        <BioContainer person={this.props.selectedPerson} />
                        <KeyContainer person={this.props.selectedPerson}
                            keyInUseUpdated={this.props.inUseUpdated}
                            keyTotalUpdated={this.props.totalUpdated}
                            keyEdited={this.props.edited}
                        />
                        <EquipmentContainer person={this.props.selectedPerson}
                            equipmentInUseUpdated={this.props.inUseUpdated}
                            equipmentTotalUpdated={this.props.totalUpdated}
                            equipmentEdited={this.props.edited}/>
                        <AccessContainer person={this.props.selectedPerson} 
                            accessInUseUpdated={this.props.inUseUpdated}
                            accessTotalUpdated={this.props.totalUpdated}
                            accessEdited={this.props.edited}/>
                        <WorkstationContainer 
                            person={this.props.selectedPerson} 
                            tags={this.props.tags}
                            workstationInUseUpdated={this.props.inUseUpdated}
                            workstationTotalUpdated={this.props.totalUpdated}
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
