import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
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

  const tags = Array.from(
    new Set(
      (selectedAccess.tags || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    )
  );

  return (
    <div className='space-y-6'>
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
              {selectedAccess.name}
            </h1>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              className='btn btn-sm btn-asset btn-outline'
              onClick={() => setShouldOpenEditModal(true)}
            >
              <PencilSquareIcon className='size-4' aria-hidden='true' />
              Edit Access
            </button>
            <button
              type='button'
              className='btn btn-sm btn-error btn-outline'
              onClick={() => props.openDeleteModal(selectedAccess)}
            >
              <TrashIcon className='size-4' aria-hidden='true' />
              Delete Access
            </button>
          </div>
        </div>
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2' aria-label='Access tags'>
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
        {selectedAccess.notes && (
          <p className='m-0 whitespace-pre-wrap break-words text-sm text-base-content/80'>
            {selectedAccess.notes}
          </p>
        )}
      </header>
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
