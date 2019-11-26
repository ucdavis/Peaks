import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IAccess } from '../../Types';
import SearchTags from '../Tags/SearchTags';
import AccessAssignmentCard from './AccessAssignmentCard';
import AccessAssignmentTable from './AccessAssignmentTable';

interface IProps {
  selectedAccess: IAccess;
  disableEditing: boolean;
  openEditModal?: (access: IAccess) => void;
  tags?: string[];
  onAccessUpdate?(access: IAccess);
}

export default class AccessEditValues extends React.Component<React.PropsWithChildren<IProps>> {
  constructor(props: React.PropsWithChildren<IProps>) {
    super(props);
    if (!props.disableEditing && !props.onAccessUpdate) {
      throw new Error(
        'If the access is editable then a callback must be provided'
      );
    }
  }
  public render() {
    const access = this.props.selectedAccess;
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
              onChange={e => this.props.onAccessUpdate({...access, name: e.target.value})}
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
              onChange={e => this.props.onAccessUpdate({...access, notes: e.target.value})}
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
              onSelect={e => {
                access.tags = e.join(',')
                this.props.onAccessUpdate(access)
              }}
            />
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
