import { startOfDay } from 'date-fns';
import * as React from 'react';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-date-picker';
import { IPerson } from '../../models/People';
import { IValidationError } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import SearchTags from '../Tags/SearchTags';
import AssignPerson from './AssignPerson';

interface IProps {
  changeProperty?: (property: string, value: any) => void;
  changeSupervisor?: (supervisor: IPerson) => void;
  tags?: string[];
  disableEditing: boolean;
  selectedPerson: IPerson;
  space?: ISpace;
  creating?: boolean;
  error?: IValidationError;
  isDeleting?: boolean;
}

const PersonEditValues = (props: IProps) => {
  if (!props.selectedPerson) {
    return null;
  }
  const error = props.error;

  const changeStartDate = (date: Date) => {
    date === null
      ? props.changeProperty('startDate', null)
      : props.changeProperty('startDate', startOfDay(date));
  };

  const changeEndDate = (date: any) => {
    date === null
      ? props.changeProperty('endDate', null)
      : props.changeProperty('endDate', startOfDay(date));
  };

  return (
    <div className='wrapperasset'>
      <FormGroup>
        <Label for='First Name'>First Name</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={
            props.selectedPerson.firstName ? props.selectedPerson.firstName : ''
          }
          onChange={e => props.changeProperty('firstName', e.target.value)}
          invalid={error && error.path === 'firstName'}
        />
        <FormFeedback>
          {error && error.path === 'firstName' && error.message}
        </FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for='Last Name'>Last Name</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={
            props.selectedPerson.lastName ? props.selectedPerson.lastName : ''
          }
          onChange={e => props.changeProperty('lastName', e.target.value)}
          invalid={error && error.path === 'lastName'}
        />
        <FormFeedback>
          {error && error.path === 'lastName' && error.message}
        </FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for='Email'>Email</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={props.selectedPerson.email ? props.selectedPerson.email : ''}
          onChange={e => props.changeProperty('email', e.target.value)}
          invalid={error && error.path === 'email'}
        />
        <FormFeedback>
          {error && error.path === 'email' && error.message}
        </FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for='Home Phone Number'>Home Phone Number</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={
            props.selectedPerson.homePhone ? props.selectedPerson.homePhone : ''
          }
          onChange={e => props.changeProperty('homePhone', e.target.value)}
          invalid={error && error.path === 'homePhone'}
        />
        <FormFeedback>
          {error && error.path === 'homePhone' && error.message}
        </FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for='Team Phone Number'>Team Phone Number</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={
            props.selectedPerson.teamPhone ? props.selectedPerson.teamPhone : ''
          }
          onChange={e => props.changeProperty('teamPhone', e.target.value)}
          invalid={error && error.path === 'teamPhone'}
        />
        <FormFeedback>
          {error && error.path === 'teamPhone' && error.message}
        </FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for='Title'>Title</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={props.selectedPerson.title ? props.selectedPerson.title : ''}
          onChange={e => props.changeProperty('title', e.target.value)}
          invalid={error && error.path === 'title'}
        />
        <FormFeedback>
          {error && error.path === 'title' && error.message}
        </FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for='Start Date'>Start Date</Label>
        <br />
        <DatePicker
          disabled={props.isDeleting}
          value={
            props.selectedPerson && props.selectedPerson.startDate
              ? new Date(props.selectedPerson.startDate)
              : null
          }
          onChange={changeStartDate}
          format='MM/dd/yyyy'
          clearIcon={<FontAwesomeIcon icon={faTrash} pull='right' />}
        />
      </FormGroup>

      <FormGroup>
        <Label for='End Date'>End Date</Label>
        <br />
        <DatePicker
          disabled={props.isDeleting}
          value={
            props.selectedPerson && props.selectedPerson.endDate
              ? new Date(props.selectedPerson.endDate)
              : null
          }
          onChange={changeEndDate}
          format='MM/dd/yyyy'
          clearIcon={<FontAwesomeIcon icon={faTrash} pull='right' />}
        />
      </FormGroup>

      <AssignPerson
        disabled={props.disableEditing}
        onSelect={props.changeSupervisor}
        person={props.selectedPerson.supervisor}
        isRequired={false}
        label='Supervisor'
      />

      <FormGroup>
        <Label for='Category'>Category</Label>
        <Input
          type='select'
          disabled={props.disableEditing}
          onChange={e => props.changeProperty('category', e.target.value)}
          className='form-control'
          value={
            props.selectedPerson.category ? props.selectedPerson.category : ''
          }
        >
          <option value=''>-- Not Set --</option>
          <option value='Faculty'>Faculty</option>
          <option value='Adjunct Faculty'>Adjunct Faculty</option>
          <option value='Lecturer'>Lecturer</option>
          <option value='Research'>Research</option>
          <option value='Staff'>Staff</option>
          <option value='Admin Staff'>Admin Staff</option>
          <option value='Grad Student'>Grad Student</option>
          <option value='Postdoc'>Postdoc</option>
          <option value='Undergrad'>Undergrad</option>
          <option value='Visitor'>Visitor</option>
          <option value='Volunteer'>Volunteer</option>
        </Input>
      </FormGroup>

      <FormGroup>
        <Label for='Notes'>Notes</Label>
        <Input
          type='textarea'
          className='form-control'
          readOnly={props.disableEditing}
          value={props.selectedPerson.notes || ''}
          onChange={e => props.changeProperty('notes', e.target.value)}
        />
      </FormGroup>

      <FormGroup>
        <Label for='Tags'>Tags</Label>
        <SearchTags
          tags={props.tags}
          disabled={props.disableEditing}
          selected={
            !!props.selectedPerson.tags
              ? props.selectedPerson.tags.split(',')
              : []
          }
          onSelect={e => props.changeProperty('tags', e.join(','))}
        />
      </FormGroup>
    </div>
  );
};

export default PersonEditValues;
