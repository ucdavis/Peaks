import * as React from 'react';
import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RouteChildrenProps } from 'react-router';
import { Button } from 'reactstrap';
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

  return (
    <div>
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
      <div className='mb-3'>
        <Button color='link' onClick={props.goBack}>
          <i className='fas fa-arrow-left fa-xs' /> Return to Table
        </Button>
      </div>
      <h2 className='mb-3'>
        {selectedKeyInfo.key.name} - {selectedKeyInfo.key.code}
      </h2>
      {selectedKeyInfo.key.tags && (
        <p>
          <i className='fas fa-tags mr-2' aria-hidden='true' />
          {selectedKeyInfo.key.tags}
        </p>
      )}
      {selectedKeyInfo.key.notes && (
        <p>
          <i className='fas fa-comment-alt mr-2' aria-hidden='true' />
          {selectedKeyInfo.key.notes}
        </p>
      )}
      <div className='mb-3'>
        <Button color='link' onClick={() => setShouldOpenEditModal(true)}>
          <i className='fas fa-edit fa-xs' /> Edit Key
        </Button>
      </div>
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
