import { AssetSummary } from './AssetSummary';
import * as React from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FormGroup, Label } from 'reactstrap';
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
          monthAriaLabel='Month'
          dayAriaLabel='Day'
          yearAriaLabel='Year'
          calendarAriaLabel='Toggle calendar'
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
  return <AssetSummary fields={[[props.label || 'Expiration date',
    props.date ? DateUtil.formatExpiration(props.date) : null]]} />;
};

export default AssignDate;
