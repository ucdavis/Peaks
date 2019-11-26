import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IValidationError } from '../../models/Shared';
import { IWorkstation } from '../../models/Workstations';
import { ISpace } from '../../Types';
import SearchSpaces from '../Spaces/SearchSpaces';
import SearchTags from '../Tags/SearchTags';

interface IProps {
  changeProperty?: (property: string, value: any) => void;
  openEditModal?: (workstation: IWorkstation) => void;
  tags?: string[];
  disableEditing: boolean;
  disableSpaceEditing: boolean;
  selectedWorkstation: IWorkstation;
  space?: ISpace;
  error?: IValidationError;
}

export default class WorkstationEditValues extends React.Component<IProps, {}> {
  public render() {
    if (!this.props.selectedWorkstation) {
      return null;
    }
    const error = this.props.error;
    return (
      <div>
        {this.props.disableEditing && this.props.openEditModal && (
          <div className='row justify-content-between'>
            <h3>Workstation Details</h3>
            <Button
              color='link'
              onClick={() =>
                this.props.openEditModal(this.props.selectedWorkstation)
              }
            >
              <i className='fas fa-edit fa-xs' /> Edit Workstation
            </Button>
          </div>
        )}
        <div className='wrapperasset'>
          <FormGroup>
            <Label for='name'>Name</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={this.props.disableEditing}
              value={
                this.props.selectedWorkstation.name
                  ? this.props.selectedWorkstation.name
                  : ''
              }
              onChange={e => this.props.changeProperty('name', e.target.value)}
              invalid={error && error.path === 'name'}
            />
            <FormFeedback>
              {error && error.path === 'name' && error.message}
            </FormFeedback>
          </FormGroup>

          {this.props.disableSpaceEditing && (
            <div className='form-group'>
              <label>Room</label>
              <input
                type='text'
                className='form-control'
                disabled={true}
                value={
                  this.props.selectedWorkstation.space
                    ? `${this.props.selectedWorkstation.space.roomNumber} ${this.props.selectedWorkstation.space.bldgName}`
                    : ''
                }
              />
            </div>
          )}
          {!this.props.disableSpaceEditing && (
            <FormGroup>
              <Label for='room'>Room</Label>
              <SearchSpaces
                onSelect={space => this.props.changeProperty('space', space)}
                defaultSpace={
                  this.props.space
                    ? this.props.space
                    : this.props.selectedWorkstation.space
                }
                isRequired={true}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label for='notes'>Notes</Label>
            <Input
              type='textarea'
              className='form-control'
              readOnly={this.props.disableEditing}
              value={this.props.selectedWorkstation.notes || ''}
              onChange={e => this.props.changeProperty('notes', e.target.value)}
              invalid={error && error.path === 'notes'}
            />
            <FormFeedback>
              {error && error.path === 'notes' && error.message}
            </FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for='tags'>Tags</Label>
            <SearchTags
              tags={this.props.tags}
              disabled={this.props.disableEditing}
              selected={
                !!this.props.selectedWorkstation.tags
                  ? this.props.selectedWorkstation.tags.split(',')
                  : []
              }
              onSelect={e => this.props.changeProperty('tags', e.join(','))}
            />
            <FormFeedback>
              {error && error.path === 'tags' && error.message}
            </FormFeedback>
          </FormGroup>
        </div>
      </div>
    );
  }
}
