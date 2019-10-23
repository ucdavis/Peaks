import * as React from 'react';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess } from '../../Types';
import AccessAssignmentContainer from './AccessAssignmentContainer';

interface IProps {
  goBack: () => void;
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
  openEditModal: (access: IAccess) => void;
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

        <h2>Details for {access.name}</h2>

        <AccessAssignmentContainer
          access={this.props.selectedAccess}
          onAssignSuccess={assignment => {
            access.assignments.push(assignment);
            this.props.updateSelectedAccess(access);
          }}
        />
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
