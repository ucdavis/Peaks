import * as React from 'react';
import { RouteChildrenProps } from 'react-router';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IKey, IMatchParams, IPerson, IPersonInfo } from '../../Types';
import { PermissionsUtil } from '../../util/permissions';
import AccessContainer from '../Access/AccessContainer';
import EquipmentContainer from '../Equipment/EquipmentContainer';
import HistoryContainer from '../History/HistoryContainer';
import KeySerialContainer from '../Keys/KeySerialContainer';
import WorkstationContainer from '../Workstations/WorkstationContainer';
import BioContainer from './BioContainer';
import DeletePerson from './DeletePerson';
import EditPerson from './EditPerson';

interface IProps {
  router: RouteChildrenProps<IMatchParams>;
  goBack: () => void;
  selectedPersonInfo: IPersonInfo;
  tags: string[];
  inUseUpdated: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  edited?: (type: string, spaceId: number, personId: number) => void;
  onEdit: (person: IPerson) => void;
  onDelete: (person: IPerson) => void;
  goToKeyDetails: (key: IKey) => void;
}

export default class PersonDetails extends React.Component<IProps, {}> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  public render() {
    if (
      !this.props.selectedPersonInfo ||
      !this.props.selectedPersonInfo.person
    ) {
      return null;
    }
    const canEdit = PermissionsUtil.canEditPeople(this.context.permissions);
    return (
      <div>
        <div>
          <Button color='link' onClick={this.props.goBack}>
            <i className='fas fa-arrow-left fa-xs' /> Return to Table
          </Button>
        </div>
        <br />
        <div className='card'>
          <div className='card-header-people'>
            <div className='card-head row justify-content-between'>
              <h2>{this.props.selectedPersonInfo.person.name}</h2>
              {canEdit && (
                <div className='row justify-content-between'>
                  <EditPerson
                    onEdit={this.props.onEdit}
                    selectedPerson={this.props.selectedPersonInfo.person}
                    tags={this.props.tags}
                  />
                  <DeletePerson
                    selectedPersonInfo={this.props.selectedPersonInfo}
                    onDelete={this.props.onDelete}
                  />
                  <div>
                    <a
                      href={`/${this.context.team.slug}/Report/PersonTeamList/?personId=${this.props.selectedPersonInfo.id}`}
                      target='_blank'
                    >
                      <Button className='btn btn-link'>
                        <i
                          className='fas fa-search fa-sm fa-fw mr-2'
                          aria-hidden='true'
                        />
                        Lookup Teams
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <BioContainer person={this.props.selectedPersonInfo.person} />
        </div>

        <KeySerialContainer
          {...this.props.router}
          selectedPerson={this.props.selectedPersonInfo.person}
          assetInUseUpdated={this.props.inUseUpdated}
          assetEdited={this.props.edited}
          goToKeyDetails={this.props.goToKeyDetails}
        />
        <EquipmentContainer
          {...this.props.router}
          person={this.props.selectedPersonInfo.person}
          assetInUseUpdated={this.props.inUseUpdated}
          assetEdited={this.props.edited}
        />
        <AccessContainer
          {...this.props.router}
          person={this.props.selectedPersonInfo.person}
          assetInUseUpdated={this.props.inUseUpdated}
          assetEdited={this.props.edited}
        />
        <WorkstationContainer
          {...this.props.router}
          person={this.props.selectedPersonInfo.person}
          tags={this.props.tags}
          assetInUseUpdated={this.props.inUseUpdated}
          assetEdited={this.props.edited}
        />
        {canEdit && (
          <HistoryContainer
            controller='peopleAdmin'
            id={this.props.selectedPersonInfo.person.id}
          />
        )}
      </div>
    );
  }
}
