import {
  ArrowLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext } from 'react';
import { RouteChildrenProps } from 'react-router';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IPerson, IPersonInfo } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { PermissionsUtil } from '../../util/permissions';
import AccessAssignmentContainer from '../Access/AccessAssignmentContainer';
import EquipmentContainer from '../Equipment/EquipmentContainer';
import HistoryContainer from '../History/HistoryContainer';
import KeySerialContainer from '../Keys/KeySerialContainer';
import WorkstationContainer from '../Workstations/WorkstationContainer';
import BioContainer from './BioContainer';
import DeletePerson from './DeletePerson';
import EditPerson from './EditPerson';
import DocumentsContainer from '../Documents/DocumentsContainer';
import { IAccess } from '../../models/Access';

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
  goToAccessDetails: (access: IAccess) => void;
}

const PersonDetails = (props: IProps) => {
  const context = useContext(Context);
  if (!props.selectedPersonInfo || !props.selectedPersonInfo.person) {
    return null;
  }

  const canEdit = PermissionsUtil.canEditPeople(context.permissions);

  // this is the only place we render pronouns. if we use them elsewhere, we should move this to a util
  const formatPronouns = (pronouns: string) => {
    pronouns = pronouns.trim();
    if (pronouns.startsWith('(') && pronouns.endsWith(')')) {
      return pronouns; // if user has, say "(they/them" then that's their problem and i don't care
    } else {
      return `(${pronouns})`;
    }
  };

  return (
    <div className='space-y-6'>
      <button
        type='button'
        className='btn btn-sm btn-ghost'
        onClick={props.goBack}
      >
        <ArrowLeftIcon className='size-4' aria-hidden='true' /> Return to table
      </button>
      <section
        className='card border border-main-border bg-base-100 shadow-sm'
        aria-labelledby='person-details-heading'
      >
        <div className='card-header-people'>
          <div className='flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6'>
            <div className='min-w-0 space-y-1'>
              <h1
                id='person-details-heading'
                className='m-0 break-words text-2xl font-semibold'
              >
                {props.selectedPersonInfo.person.name}
              </h1>
              {!!props.selectedPersonInfo.person.user?.pronouns && (
                <p className='m-0 text-sm text-base-content/60'>
                  {formatPronouns(
                    props.selectedPersonInfo.person.user.pronouns
                  )}
                </p>
              )}
            </div>
            {canEdit && (
              <div className='ml-auto flex flex-wrap items-center justify-end gap-2'>
                <a
                  href={`/${context.team.slug}/Report/PersonTeamList/?personId=${props.selectedPersonInfo.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn btn-sm'
                >
                  <MagnifyingGlassIcon className='size-4' aria-hidden='true' />
                  Lookup teams
                </a>
                <DeletePerson
                  key={`delete-person-${props.selectedPersonInfo.id}`}
                  selectedPersonInfo={props.selectedPersonInfo}
                  onDelete={props.onDelete}
                />
                <EditPerson
                  key={`edit-person-${props.selectedPersonInfo.id}`}
                  onEdit={props.onEdit}
                  selectedPerson={props.selectedPersonInfo.person}
                  tags={props.tags}
                />
              </div>
            )}
          </div>
        </div>

        <BioContainer person={props.selectedPersonInfo.person} />
      </section>

      <KeySerialContainer
        selectedPerson={props.selectedPersonInfo.person}
        assetInUseUpdated={props.inUseUpdated}
        goToKeyDetails={props.goToKeyDetails}
      />
      <EquipmentContainer
        person={props.selectedPersonInfo.person}
        assetInUseUpdated={props.inUseUpdated}
      />
      <AccessAssignmentContainer
        person={props.selectedPersonInfo.person}
        onRevokeSuccess={() =>
          props.inUseUpdated('access', 0, props.selectedPersonInfo.id, -1)
        }
        onAssignSuccess={() =>
          props.inUseUpdated('access', 0, props.selectedPersonInfo.id, 1)
        }
        goToAccessDetails={props.goToAccessDetails}
      />
      <WorkstationContainer
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
          showLink={true}
        />
      )}
    </div>
  );
};

export default PersonDetails;
