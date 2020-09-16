import * as React from 'react';
import { useContext } from 'react';
import { RouteChildrenProps } from 'react-router';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IPerson, IPersonInfo } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { PermissionsUtil } from '../../util/permissions';
import AssignmentContainer from '../Access/AccessAssignmentContainer';
import EquipmentContainer from '../Equipment/EquipmentContainer';
import HistoryContainer from '../History/HistoryContainer';
import KeySerialContainer from '../Keys/KeySerialContainer';
import WorkstationContainer from '../Workstations/WorkstationContainer';
import BioContainer from './BioContainer';
import DeletePerson from './DeletePerson';
import EditPerson from './EditPerson';
import DocumentsContainer from '../Documents/DocumentsContainer';

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
  onEdit: (person: IPerson) => void;
  onDelete: (person: IPerson) => void;
  goToKeyDetails: (key: IKey) => void;
}

const PersonDetails = (props: IProps) => {
  const context = useContext(Context);
  if (!props.selectedPersonInfo || !props.selectedPersonInfo.person) {
    return null;
  }

  const canEdit = PermissionsUtil.canEditPeople(context.permissions);

  return (
    <div>
      <div>
        <Button color='link' onClick={props.goBack}>
          <i className='fas fa-arrow-left fa-xs' /> Return to Table
        </Button>
      </div>
      <br />
      <div className='card'>
        <div className='card-header-people'>
          <div className='card-head row justify-content-between'>
            <h2>{props.selectedPersonInfo.person.name}</h2>
            {canEdit && (
              <div className='row justify-content-between'>
                <EditPerson
                  key={`edit-person-${props.selectedPersonInfo.id}`}
                  onEdit={props.onEdit}
                  selectedPerson={props.selectedPersonInfo.person}
                  tags={props.tags}
                />
                <DeletePerson
                  key={`delete-person-${props.selectedPersonInfo.id}`}
                  selectedPersonInfo={props.selectedPersonInfo}
                  onDelete={props.onDelete}
                />
                <div>
                  <a
                    href={`/${context.team.slug}/Report/PersonTeamList/?personId=${props.selectedPersonInfo.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Button color='link'>
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

        <BioContainer person={props.selectedPersonInfo.person} />
      </div>

      <KeySerialContainer
        {...props.router}
        selectedPerson={props.selectedPersonInfo.person}
        assetInUseUpdated={props.inUseUpdated}
        goToKeyDetails={props.goToKeyDetails}
      />
      <EquipmentContainer
        {...props.router}
        person={props.selectedPersonInfo.person}
        assetInUseUpdated={props.inUseUpdated}
      />
      <AssignmentContainer
        person={props.selectedPersonInfo.person}
        onRevokeSuccess={() =>
          props.inUseUpdated('access', 0, props.selectedPersonInfo.id, -1)
        }
        onAssignSuccess={() =>
          props.inUseUpdated('access', 0, props.selectedPersonInfo.id, 1)
        }
      />
      <WorkstationContainer
        {...props.router}
        person={props.selectedPersonInfo.person}
        tags={props.tags}
        assetInUseUpdated={props.inUseUpdated}
      />
      <DocumentsContainer
        person={props.selectedPersonInfo.person}
      ></DocumentsContainer>
      {canEdit && (
        <HistoryContainer
          controller='peopleAdmin'
          id={props.selectedPersonInfo.person.id}
        />
      )}
    </div>
  );
};

export default PersonDetails;
