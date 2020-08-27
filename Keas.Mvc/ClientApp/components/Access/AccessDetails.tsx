import * as React from 'react';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess } from '../../models/Access';
import SearchTags from '../Tags/SearchTags';
import AccessAssignmentContainer from './AccessAssignmentContainer';
import HistoryContainer from '../History/HistoryContainer';

interface IProps {
  goBack: () => void;
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
  openEditModal: (access: IAccess) => void;
  openDeleteModal: (access: IAccess) => void;
  updateSelectedAccess: (access: IAccess, id?: number) => void;
}

export default class AccessDetails extends React.Component<IProps, {}> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  public componentDidMount() {
    if (!this.props.selectedAccess) {
      return;
    }
    this._fetchDetails(this.props.selectedAccess.id);
  }

  public render() {
    if (!this.props.selectedAccess) {
      return null;
    }
    const access = this.props.selectedAccess;
    return (
      <div>
        <div className='mb-3'>
          <Button color='link' onClick={this.props.goBack}>
            <i className='fas fa-arrow-left fa-xs' /> Return to Table
          </Button>
        </div>
        <div className='d-flex flex-row flex-wrap-reverse justify-content-between'>
          <h2>Details for {access.name}</h2>
          <div>
            <Button
              color='link'
              onClick={() => {
                this.props.openEditModal(access);
              }}
            >
              <i className='fas fa-edit fa-sm fa-fw mr-2' aria-hidden='true' />
              Edit Access
            </Button>
            <Button
              color='link'
              onClick={() => {
                this.props.openDeleteModal(access);
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
          access={this.props.selectedAccess}
          onAssignSuccess={assignment => {
            access.assignments.push(assignment);
            this.props.updateSelectedAccess(access);
          }}
          onRevokeSuccess={assignment => {
            access.assignments.splice(
              access.assignments.indexOf(assignment),
              1
            );
            this.props.updateSelectedAccess(access);
          }}
        />
        <HistoryContainer controller='access' id={access.id} />
      </div>
    );
  }

  private _fetchDetails = async (id: number) => {
    const url = `/api/${this.context.team.slug}/access/details/${id}`;
    let access: IAccess = null;
    try {
      access = await this.context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The access you were trying to view could not be found. It may have been deleted.'
        );
        this.props.updateSelectedAccess(null, id);
        this.props.closeModal();
      } else {
        toast.error(
          'Error fetching access details. Please refresh the page to try again.'
        );
      }
      return;
    }
    this.props.updateSelectedAccess(access);
  };
}
