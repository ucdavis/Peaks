import * as PropTypes from 'prop-types';
import * as React from "react";
import {
    Button,
} from "reactstrap";
import { AppContext, IPerson, IPersonInfo } from "../../Types";
import AccessContainer from "../Access/AccessContainer";
import EquipmentContainer from "../Equipment/EquipmentContainer";
import HistoryContainer from "../History/HistoryContainer";
import KeySerialContainer from "../Keys/KeySerialContainer";
import WorkstationContainer from "../Workstations/WorkstationContainer";
import BioContainer from "./BioContainer";
import DeletePerson from './DeletePerson';
import EditPerson from "./EditPerson";

interface IProps {
    goBack: () => void;
    selectedPersonInfo: IPersonInfo;
    tags: string[];
    inUseUpdated: (type: string, spaceId: number, personId: number, count: number) => void;
    edited?: (type: string, spaceId: number, personId: number) => void;
    onEdit: (person: IPerson) => void;
    onDelete: (person: IPerson) => void;
}


export default class PersonDetails extends React.Component<IProps, {}> {
    public static contextTypes = {
        fetch: PropTypes.func,
        router: PropTypes.object,
        team: PropTypes.object
      };
      public context: AppContext;
    public render() {
        if (!this.props.selectedPersonInfo || !this.props.selectedPersonInfo.person)
        {
            return null;
        }
        return (
            <div>

                <div>
                    <Button color="link" onClick={this.props.goBack}>
                        <i className="fas fa-arrow-left fa-xs"/> Return to Table
                    </Button>

                </div>
              <br/>
                <div>
                        <BioContainer person={this.props.selectedPersonInfo.person}/>
                        <EditPerson onEdit={this.props.onEdit} selectedPerson={this.props.selectedPersonInfo.person} tags={this.props.tags}/>
                        <DeletePerson selectedPersonInfo={this.props.selectedPersonInfo} onDelete={this.props.onDelete} />
                        <div>
                            <a href={`/${this.context.team.slug}/Report/PersonTeamList/?personId=${this.props.selectedPersonInfo.id}`} target="_blank">
                                <Button className="btn btn-link">
                                    <i className="fas fa-search fa-sm fa-fw" aria-hidden="true" />  Lookup Teams
                                </Button>
                            </a>
                        </div>
                        <KeySerialContainer
                            selectedPerson={this.props.selectedPersonInfo.person}
                            assetInUseUpdated={this.props.inUseUpdated}
                            assetEdited={this.props.edited}
                        />
                        <EquipmentContainer
                            person={this.props.selectedPersonInfo.person}
                            assetInUseUpdated={this.props.inUseUpdated}
                            assetEdited={this.props.edited}/>
                        <AccessContainer
                            person={this.props.selectedPersonInfo.person}
                            assetInUseUpdated={this.props.inUseUpdated}
                            assetEdited={this.props.edited}/>
                        <WorkstationContainer
                            person={this.props.selectedPersonInfo.person}
                            tags={this.props.tags}
                            assetInUseUpdated={this.props.inUseUpdated}
                            assetEdited={this.props.edited}/>
                        <HistoryContainer controller="people" id={this.props.selectedPersonInfo.person.id} />
                </div>
            </div>

        );
    }
}
