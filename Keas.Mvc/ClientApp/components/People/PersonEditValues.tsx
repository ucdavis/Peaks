import { startOfDay } from 'date-fns';
import * as React from 'react';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
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

export default class PersonEditValues extends React.Component<IProps, {}> {
  public render() {
    if (!this.props.selectedPerson) {
      return null;
    }
    const error = this.props.error;
    return (
      <div className='wrapperasset'>
        <FormGroup>
          <Label for='First Name'>First Name</Label>
          <Input
            type='text'
            className='form-control'
            readOnly={this.props.disableEditing}
            value={
              this.props.selectedPerson.firstName
                ? this.props.selectedPerson.firstName
                : ''
            }
            onChange={e =>
              this.props.changeProperty('firstName', e.target.value)
            }
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
            readOnly={this.props.disableEditing}
            value={
              this.props.selectedPerson.lastName
                ? this.props.selectedPerson.lastName
                : ''
            }
            onChange={e =>
              this.props.changeProperty('lastName', e.target.value)
            }
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
            readOnly={this.props.disableEditing}
            value={
              this.props.selectedPerson.email
                ? this.props.selectedPerson.email
                : ''
            }
            onChange={e => this.props.changeProperty('email', e.target.value)}
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
            readOnly={this.props.disableEditing}
            value={
              this.props.selectedPerson.homePhone
                ? this.props.selectedPerson.homePhone
                : ''
            }
            onChange={e =>
              this.props.changeProperty('homePhone', e.target.value)
            }
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
            readOnly={this.props.disableEditing}
            value={
              this.props.selectedPerson.teamPhone
                ? this.props.selectedPerson.teamPhone
                : ''
            }
            onChange={e =>
              this.props.changeProperty('teamPhone', e.target.value)
            }
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
            readOnly={this.props.disableEditing}
            value={
              this.props.selectedPerson.title
                ? this.props.selectedPerson.title
                : ''
            }
            onChange={e => this.props.changeProperty('title', e.target.value)}
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
            disabled={this.props.isDeleting}
            value={
              this.props.selectedPerson && this.props.selectedPerson.startDate
                ? new Date(this.props.selectedPerson.startDate)
                : null
            }
            onChange={this._changeStartDate}
            format='MM/dd/yyyy'
            clearIcon={null}
          />
        </FormGroup>

        <FormGroup>
          <Label for='End Date'>End Date</Label>
          <br />
          <DatePicker
            disabled={this.props.isDeleting}
            value={
              this.props.selectedPerson && this.props.selectedPerson.endDate
                ? new Date(this.props.selectedPerson.endDate)
                : null
            }
            onChange={this._changeEndDate}
            format='MM/dd/yyyy'
            clearIcon={null}
          />
        </FormGroup>

        <AssignPerson
          disabled={this.props.disableEditing}
          onSelect={this.props.changeSupervisor}
          person={this.props.selectedPerson.supervisor}
          isRequired={false}
          label='Supervisor'
        />

        <FormGroup>
          <Label for='Category'>Category</Label>
          <Input
            type='select'
            disabled={this.props.disableEditing}
            onChange={e =>
              this.props.changeProperty('category', e.target.value)
            }
            className='form-control'
            value={
              this.props.selectedPerson.category
                ? this.props.selectedPerson.category
                : ''
            }
          >
            <option value=''>-- Not Set --</option>
            <option value='Faculty'>Faculty</option>
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
            readOnly={this.props.disableEditing}
            value={this.props.selectedPerson.notes || ''}
            onChange={e => this.props.changeProperty('notes', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label for='Tags'>Tags</Label>
          <SearchTags
            tags={this.props.tags}
            disabled={this.props.disableEditing}
            selected={
              !!this.props.selectedPerson.tags
                ? this.props.selectedPerson.tags.split(',')
                : []
            }
            onSelect={e => this.props.changeProperty('tags', e.join(','))}
          />
        </FormGroup>
      </div>
    );
  }

  private _changeStartDate = (date: Date) => {
    if (date === null) {
      date = new Date(this.props.selectedPerson.startDate);
    }

    this.props.changeProperty('startDate', startOfDay(date));
  };

  private _changeEndDate = (date: any) => {
    if (date === null) {
      date = new Date(this.props.selectedPerson.endDate);
    }

    this.props.changeProperty('endDate', startOfDay(date));
  };
}
