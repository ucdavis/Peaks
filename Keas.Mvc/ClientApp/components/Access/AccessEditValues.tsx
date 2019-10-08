import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../Types';
import SearchTags from '../Tags/SearchTags';
import AccessAssignTable from './AccessAssignTable';

interface IProps {
  selectedAccess: IAccess;
  disableEditing: boolean;
  changeProperty?: (property: string, value: string) => void;
  onRevoke: (accessAssignment: IAccessAssignment) => void;
  openEditModal?: (access: IAccess) => void;
  tags?: string[];
}

export default class AccessEditValues extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        {this.props.disableEditing && this.props.openEditModal && (
          <div className='row justify-content-between'>
            <h3>Access Details</h3>
            <Button
              color='link'
              onClick={() =>
                this.props.openEditModal(this.props.selectedAccess)
              }
            >
              <i className='fas fa-edit fa-xs' /> Edit Access
            </Button>
          </div>
        )}
        <div className='wrapperasset'>
          <FormGroup>
            <Label for='name'>Name</Label>
            <Input
              type='text'
              className='form-control'
              disabled={this.props.disableEditing}
              value={
                this.props.selectedAccess && this.props.selectedAccess.name
                  ? this.props.selectedAccess.name
                  : ''
              }
              onChange={e => this.props.changeProperty('name', e.target.value)}
              invalid={!this.props.selectedAccess.name}
            />
            <FormFeedback>Item name is required</FormFeedback>
          </FormGroup>
          <div className='form-group'>
            <label>Notes</label>
            <textarea
              className='form-control'
              disabled={this.props.disableEditing}
              value={this.props.selectedAccess.notes || ''}
              onChange={e => this.props.changeProperty('notes', e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>Tags</label>
            <SearchTags
              tags={this.props.tags}
              disabled={this.props.disableEditing}
              selected={
                !!this.props.selectedAccess && !!this.props.selectedAccess.tags
                  ? this.props.selectedAccess.tags.split(',')
                  : []
              }
              onSelect={e => this.props.changeProperty('tags', e.join(','))}
            />
          </div>
          {this.props.selectedAccess.teamId !== 0 &&
            this.props.selectedAccess.assignments.length > 0 && (
              <AccessAssignTable
                onRevoke={async (assignment) => this.props.onRevoke(assignment)}
                assignments={this.props.selectedAccess.assignments}
              />
            )}
        </div>
      </div>
    );
  }

  private _revokeSelected = async (personId: number) => {
    const accessAssignment = this.props.selectedAccess.assignments.filter(
      x => x.personId === personId
    );
    try {
      await this.props.onRevoke(accessAssignment[0]);
    } catch (err) {
      // TODO: add submitting state and handle
      return;
    }
  };
}
