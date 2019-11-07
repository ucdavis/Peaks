import * as React from 'react';
import DatePicker from 'react-date-picker';
import { FormFeedback, FormGroup, Label } from 'reactstrap';
import { IValidationError } from '../../models/Shared';

interface IProps {
  onChangeDate: (newDate: Date) => void;
  date: Date;
  isRequired: boolean;
  error?: IValidationError;
}

// tslint:disable-next-line: variable-name
export const AssignDate = (props: IProps) => {
  return (
    <FormGroup>
      <Label for='date'>Set the expiration date</Label>
      <br />
      <DatePicker
        format='MM/dd/yyyy'
        required={props.isRequired}
        clearIcon={null}
        value={props.date}
        onChange={props.onChangeDate}
      />
      {props.error && props.error.path === 'date' && (
        <div className='invalid-feedback d-block'>{props.error.message}</div>
      )}
    </FormGroup>
  );
};
