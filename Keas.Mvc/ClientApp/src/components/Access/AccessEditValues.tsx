import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IAccess } from '../../models/Access';
import { IValidationError } from '../../models/Shared';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

interface IProps {
  selectedAccess: IAccess;
  disableEditing: boolean;
  tags?: string[];
  error?: IValidationError;
  onAccessUpdate?: (access: IAccess) => void;
  goToAccessDetails?: (access: IAccess) => void;
}

const AccessEditValues = (props: IProps) => {
  if (!props.disableEditing && !props.onAccessUpdate) {
    throw new Error(
      'If the access is editable then a callback must be provided'
    );
  }

  const goToAccessDetails = () => {
    if (!props.selectedAccess) {
      return;
    }
    props.goToAccessDetails(props.selectedAccess);
  };

  const access = props.selectedAccess;
  const error = props.error;

  return (
    <div>
      <div className='row justify-content-between'>
        <h3>Access Details</h3>
      </div>
      <div className='wrapperasset'>
        <FormGroup>
          <Label for='name'>Name</Label>
          <Input
            type='text'
            className='form-control'
            readOnly={props.disableEditing}
            value={
              props.selectedAccess && props.selectedAccess.name
                ? props.selectedAccess.name
                : ''
            }
            onChange={e =>
              props.onAccessUpdate({ ...access, name: e.target.value })
            }
            invalid={error && error.path === 'name'}
          />
          <FormFeedback>
            {error && error.path === 'name' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label>Notes</Label>
          <Input
            type='textarea'
            className='form-control'
            readOnly={props.disableEditing}
            value={
              !!props.selectedAccess?.notes ? props.selectedAccess.notes : ''
            }
            onChange={e =>
              props.onAccessUpdate({ ...access, notes: e.target.value })
            }
            invalid={error && error.path === 'notes'}
          />
          <FormFeedback>
            {error && error.path === 'notes' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label>Tags</Label>
          <SearchDefinedOptions
            definedOptions={props.tags}
            disabled={props.disableEditing}
            selected={
              !!props.selectedAccess && !!props.selectedAccess.tags
                ? props.selectedAccess.tags.split(',')
                : []
            }
            onSelect={e => {
              props.onAccessUpdate({ ...access, tags: e.join(',') });
            }}
            placeholder='Search for Tags'
            id='searchTags'
          />
          <FormFeedback>
            {error && error.path === 'tags' && error.message}
          </FormFeedback>
        </FormGroup>
        {props.goToAccessDetails && (
          <Button color='link' onClick={() => goToAccessDetails()}>
            <i className='fas fa-link fa-xs' /> View Access Details
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessEditValues;
