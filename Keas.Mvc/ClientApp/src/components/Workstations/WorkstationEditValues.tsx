import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IValidationError } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import { IWorkstation } from '../../models/Workstations';
import SearchSpaces from '../Spaces/SearchSpaces';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

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

const WorkstationEditValues = (props: IProps) => {
  if (!props.selectedWorkstation) {
    return null;
  }
  const error = props.error;

  return (
    <div>
      {props.disableEditing && props.openEditModal && (
        <div className='row justify-content-between'>
          <h3>Workstation Details</h3>
          <Button
            color='link'
            onClick={() => props.openEditModal(props.selectedWorkstation)}
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
            readOnly={props.disableEditing}
            value={
              props.selectedWorkstation.name
                ? props.selectedWorkstation.name
                : ''
            }
            onChange={e => props.changeProperty('name', e.target.value)}
            invalid={error && error.path === 'name'}
          />
          <FormFeedback>
            {error && error.path === 'name' && error.message}
          </FormFeedback>
        </FormGroup>

        {props.disableSpaceEditing && (
          <div className='form-group'>
            <label>Room</label>
            <input
              type='text'
              className='form-control'
              disabled={true}
              value={
                props.selectedWorkstation.space
                  ? `${props.selectedWorkstation.space.roomNumber} ${props.selectedWorkstation.space.bldgName}`
                  : ''
              }
            />
          </div>
        )}
        {!props.disableSpaceEditing && (
          <FormGroup>
            <Label for='room'>Room</Label>
            <SearchSpaces
              onSelect={space => props.changeProperty('space', space)}
              defaultSpace={
                props.space ? props.space : props.selectedWorkstation.space
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
            readOnly={props.disableEditing}
            value={props.selectedWorkstation.notes || ''}
            onChange={e => props.changeProperty('notes', e.target.value)}
            invalid={error && error.path === 'notes'}
          />
          <FormFeedback>
            {error && error.path === 'notes' && error.message}
          </FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for='tags'>Tags</Label>
          <SearchDefinedOptions
            definedOptions={props.tags}
            disabled={props.disableEditing}
            selected={
              !!props.selectedWorkstation.tags
                ? props.selectedWorkstation.tags.split(',')
                : []
            }
            onSelect={e => props.changeProperty('tags', e.join(','))}
            placeHolder='Search for Tags'
            id='searchTagsWorkstationEditValues'
          />
          <FormFeedback>
            {error && error.path === 'tags' && error.message}
          </FormFeedback>
        </FormGroup>
      </div>
    </div>
  );
};

export default WorkstationEditValues;
