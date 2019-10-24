import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IAccess } from '../../Types';
import SearchTags from '../Tags/SearchTags';
import AssignmentContainer from './AccessAssignmentContainer';

interface IProps {
  selectedAccess: IAccess;
  disableEditing: boolean;
  changeProperty?: (property: string, value: string) => void;
  openEditModal?: (access: IAccess) => void;
  tags?: string[];
  onAccessUpdate?(access: IAccess);
}

export default class AccessEditValues extends React.Component<IProps, {}> {
  constructor(props: IProps) {
    super(props);
    if (!props.disableEditing && !props.onAccessUpdate) {
      throw new Error(
        'If the access is editable then a callback must be provided'
      );
    }
  }
  public render() {
    const assignments = this.props.selectedAccess.assignments;
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
          {this.props.selectedAccess.teamId !== 0 && (
            <AssignmentContainer
              disableEditing={this.props.disableEditing}
              onRevokeSuccess={assignment =>
                this.props.onAccessUpdate({
                  ...this.props.selectedAccess,
                  assignments: assignments.splice(
                    assignments.indexOf(assignment),
                    1
                  )
                })
              }
              access={this.props.selectedAccess}
            />
          )}
        </div>
      </div>
    );
  }
}
