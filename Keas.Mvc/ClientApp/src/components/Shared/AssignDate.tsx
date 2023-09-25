import * as React from 'react';
import DatePicker from 'react-date-picker';
import { FormGroup, Input, Label } from 'reactstrap';
import { IValidationError } from '../../models/Shared';
import { DateUtil } from '../../util/dates';

interface IProps {
  onChangeDate: (newDate: Date) => void;
  date: Date;
  isRequired: boolean;
  error?: IValidationError;
  label?: string;
  disabled?: boolean;
}

const AssignDate = (props: IProps) => {
  if (!props.disabled) {
    return (
      <FormGroup>
        <Label for='date'>
          {props.label ? props.label : 'Set the expiration date'}
        </Label>
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
  }
  return (
    <FormGroup>
      <Label for='date'>{props.label ? props.label : 'Expiration Date'}</Label>
      <Input
        type='text'
        className='form-control'
        disabled={true}
        value={!!props.date ? DateUtil.formatExpiration(props.date) : ''}
      />
    </FormGroup>
  );
};

export default AssignDate;
