import { ArrowLeftIcon, ChatBubbleLeftEllipsisIcon, PencilSquareIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../models/Access';
import AccessAssignmentContainer from './AccessAssignmentContainer';
import HistoryContainer from '../History/HistoryContainer';
import EditAccess from './EditAccess';
import { PermissionsUtil } from '../../util/permissions';

interface IProps {
  goBack: () => void;
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
  editAccess: (access: IAccess) => void;
  openDeleteModal: (access: IAccess) => void;
  updateSelectedAccess: (access: IAccess, id?: number) => void;
  openEditModal: (access: IAccess) => void;
}

const AccessDetailContainer = (props: IProps) => {
  const context = useContext(Context);
  const history = useHistory();
  const [shouldOpenEditModal, setShouldOpenEditModal] = useState<boolean>(
    false
  );

  useEffect(() => {
    if (!PermissionsUtil.canViewAccess(context.permissions)) {
      return;
    }

    const { selectedAccess } = props;
    if (selectedAccess) {
      return;
    }

    const fetchDetails = async (id: number) => {
      const url = `/api/${context.team.slug}/access/details/${id}`;
      let access: IAccess = null;
      try {
        access = await context.fetch(url);
      } catch (err) {
        if (err.message === 'Not Found') {
          toast.error(
            'The access you were trying to view could not be found. It may have been deleted.'
          );
          props.updateSelectedAccess(null, id);
          props.closeModal();
        } else {
          toast.error(
            'Error fetching access details. Please refresh the page to try again.'
          );
        }
        return;
      }
      props.updateSelectedAccess(access);
    };

    fetchDetails(selectedAccess.id);
  }, [context, props]);

  const { selectedAccess } = props;
  if (!selectedAccess) {
    return null;
  }

  const closeModals = () => {
    setShouldOpenEditModal(false);
    history.push(`${getBaseUrl()}/access/details/${selectedAccess.id}`);
  };

  const getBaseUrl = () => {
    return `/${context.team.slug}`;
  };

  const onAssignSuccess = (assignments: IAccessAssignment[]) => {
    const updatedAccess = { ...selectedAccess, assignments: assignments };
    props.updateSelectedAccess(updatedAccess);
  };
  const onRevokeSuccess = (assignments: IAccessAssignment[]) => {
    const updatedAccess = { ...selectedAccess, assignments: assignments };
    props.updateSelectedAccess(updatedAccess);
  };

  return (
    <div>
      {shouldOpenEditModal ? (
        <EditAccess
          key={`edit-access-${props.selectedAccess.id}`}
          onEdit={props.editAccess}
          closeModal={closeModals}
          modal={!!selectedAccess}
          selectedAccess={selectedAccess}
          tags={context.tags}
        />
      ) : null}
      <div className='mb-3'>
        <Button color='link' onClick={props.goBack}>
          <ArrowLeftIcon data-icon="arrow-left" className='hero-icon size-4' /> Return to Table
        </Button>
      </div>
      <div className='d-flex flex-row flex-wrap-reverse justify-content-between'>
        <h2>Details for {selectedAccess.name}</h2>
        <div>
          <Button
            color='link'
            onClick={() => {
              setShouldOpenEditModal(true);
            }}
          >
            <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4 mr-2' aria-hidden='true' />
            Edit Access
          </Button>
          <Button
            color='link'
            onClick={() => {
              props.openDeleteModal(selectedAccess);
            }}
          >
            <TrashIcon data-icon="trash" className='hero-icon size-4 mr-2' aria-hidden='true' />
            Delete Access
          </Button>
        </div>
      </div>
      {selectedAccess.tags && (
        <p>
          <TagIcon data-icon="tag" className='hero-icon size-5 mr-2' aria-hidden='true' />
          {selectedAccess.tags}
        </p>
      )}
      {selectedAccess.notes && (
        <p>
          <ChatBubbleLeftEllipsisIcon data-icon="chat-bubble-left-ellipsis" className='hero-icon size-5 mr-2' aria-hidden='true' />
          {selectedAccess.notes}
        </p>
      )}
      <br />
      <AccessAssignmentContainer
        access={props.selectedAccess}
        onAssignSuccess={onAssignSuccess}
        onRevokeSuccess={onRevokeSuccess}
      />
      <HistoryContainer controller='access' id={selectedAccess.id} />
    </div>
  );
};

export default AccessDetailContainer;
