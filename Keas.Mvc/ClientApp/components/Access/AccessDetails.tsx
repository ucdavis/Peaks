import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess } from '../../models/Access';
import SearchTags from '../Tags/SearchTags';
import AccessAssignmentContainer from './AccessAssignmentContainer';
import HistoryContainer from '../History/HistoryContainer';
import EditAccess from './EditAccess';

interface IProps {
  goBack: () => void;
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
  editAccess: (accaess: IAccess) => void;
  openDeleteModal: (access: IAccess) => void;
  updateSelectedAccess: (access: IAccess, id?: number) => void;
}

const AccessDetails = (props: IProps) => {
  const context = useContext(Context);
  const history = useHistory();
  const [shouldOpenEditModal, setEditModal] = useState<boolean>(false);

  useEffect(() => {
    if (!props.selectedAccess) {
      return;
    }
    _fetchDetails(props.selectedAccess.id);
  }, [props.selectedAccess.id]);

  if (!props.selectedAccess) {
    return null;
  }

  const access = props.selectedAccess;

  const _fetchDetails = async (id: number) => {
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

  const _closeModals = () => {
    setEditModal(false);
    history.push(`${_getBaseUrl()}/access/details/${props.selectedAccess.id}`);
  };

  const _getBaseUrl = () => {
    return `/${context.team.slug}`;
  };

  return (
    <div>
      {shouldOpenEditModal ? (
        <EditAccess
          key={`edit-access-${props.selectedAccess.id}`}
          onEdit={props.editAccess}
          closeModal={_closeModals}
          modal={!!access}
          selectedAccess={access}
          tags={context.tags}
        />
      ) : null}
      <div className='mb-3'>
        <Button color='link' onClick={props.goBack}>
          <i className='fas fa-arrow-left fa-xs' /> Return to Table
        </Button>
      </div>
      <div className='d-flex flex-row flex-wrap-reverse justify-content-between'>
        <h2>Details for {access.name}</h2>
        <div>
          <Button
            color='link'
            onClick={() => {
              setEditModal(true);
            }}
          >
            <i className='fas fa-edit fa-sm fa-fw mr-2' aria-hidden='true' />
            Edit Access
          </Button>
          <Button
            color='link'
            onClick={() => {
              props.openDeleteModal(access);
            }}
          >
            <i className='fas fa-trash fa-sm fa-fw mr-2' aria-hidden='true' />
            Delete Access
          </Button>
        </div>
      </div>
      {access.notes && (
        <>
          <p>
            <b>Notes:</b>
          </p>
          <p>{access.notes}</p>
        </>
      )}

      {access.tags.length > 0 && (
        <>
          <p>
            <b>Tags</b>
          </p>
          <SearchTags
            tags={[]}
            disabled={true}
            onSelect={() => {}}
            selected={access.tags.split(',')}
          />
        </>
      )}

      <AccessAssignmentContainer
        access={props.selectedAccess}
        onAssignSuccess={assignment => {
          access.assignments.push(assignment);
          props.updateSelectedAccess(access);
        }}
        onRevokeSuccess={assignment => {
          access.assignments.splice(access.assignments.indexOf(assignment), 1);
          props.updateSelectedAccess(access);
        }}
      />
      <HistoryContainer controller='access' id={access.id} />
    </div>
  );
};

export default AccessDetails;
