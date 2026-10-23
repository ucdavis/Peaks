import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RouteChildrenProps } from 'react-router';
import { IKey, IKeyInfo } from '../../models/Keys';
import { IMatchParams } from '../../models/Shared';
import { Context } from '../../Context';
import HistoryContainer from '../History/HistoryContainer';
import SpacesContainer from '../Spaces/SpacesContainer';
import KeySerialContainer from './KeySerialContainer';
import EditKey from './EditKey';

interface IProps {
  selectedKeyInfo: IKeyInfo;
  route: RouteChildrenProps<IMatchParams>;
  goBack: () => void;
  openEditModal: (key: IKey) => void;
  serialInUseUpdated: (keyId: number, count: number) => void;
  serialTotalUpdated: (keyId: number, count: number) => void;
  spacesTotalUpdated: (keyId: number, count: number) => void;
  checkValidKeyCodeOnEdit: (code: string, id: number) => boolean;
  editKey: (key: IKey) => void;
}

const KeyDetailContainer = (props: IProps) => {
  const [shouldOpenEditModal, setShouldOpenEditModal] = useState<boolean>(
    false
  );
  const history = useHistory();
  const context = useContext(Context);
  const { selectedKeyInfo } = props;

  if (!selectedKeyInfo || !selectedKeyInfo.key) {
    return null;
  }

  const serialInUseUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    props.serialInUseUpdated(props.selectedKeyInfo.id, count);
  };

  const serialTotalUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    props.serialTotalUpdated(props.selectedKeyInfo.id, count);
  };

  const closeModals = () => {
    setShouldOpenEditModal(false);
    history.push(
      `/${context.team.slug}/keys/details/${props.selectedKeyInfo.id}`
    );
  };

  const tags = Array.from(
    new Set(
      (selectedKeyInfo.key.tags || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    )
  );

  return (
    <div className='space-y-6'>
      {shouldOpenEditModal ? (
        <EditKey
          key={`edit-key-${props.selectedKeyInfo.id}`}
          onEdit={props.editKey}
          closeModal={closeModals}
          modal={!!props.selectedKeyInfo.key}
          selectedKey={props.selectedKeyInfo.key}
          searchableTags={context.tags}
          checkIfKeyCodeIsValid={props.checkValidKeyCodeOnEdit}
        />
      ) : null}
      <button
        type='button'
        className='btn btn-sm btn-ghost'
        onClick={props.goBack}
      >
        <ArrowLeftIcon className='size-4' aria-hidden='true' /> Return to table
      </button>
      <header className='space-y-4'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0 space-y-1'>
            <h1 className='m-0 break-words text-2xl font-semibold'>
              {selectedKeyInfo.key.name}
            </h1>
            <p className='m-0 text-sm text-base-content/60'>
              Key code: {selectedKeyInfo.key.code}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              className='btn btn-sm btn-asset btn-outline'
              onClick={() => setShouldOpenEditModal(true)}
            >
              <PencilSquareIcon className='size-4' aria-hidden='true' />
              Edit Key
            </button>
          </div>
        </div>
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2' aria-label='Key tags'>
            {tags.map(tag => (
              <span
                key={tag}
                className='badge badge-asset badge-soft h-auto max-w-full break-words py-2'
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {selectedKeyInfo.key.notes && (
          <p className='m-0 whitespace-pre-wrap break-words text-sm text-base-content/80'>
            {selectedKeyInfo.key.notes}
          </p>
        )}
      </header>
      <KeySerialContainer
        {...props.route}
        selectedKey={selectedKeyInfo.key}
        assetInUseUpdated={serialInUseUpdated}
        assetTotalUpdated={serialTotalUpdated}
      />
      <SpacesContainer
        {...props.route}
        selectedKeyInfo={selectedKeyInfo}
        spacesTotalUpdated={props.spacesTotalUpdated}
      />
      <HistoryContainer controller='keys' id={selectedKeyInfo.id} />
    </div>
  );
};

export default KeyDetailContainer;
