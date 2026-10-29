import { AssetSummary } from './AssetSummary';
import * as React from 'react';
import DatePicker from 'react-date-picker';
import type { CalendarProps } from 'react-calendar';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { FormGroup } from 'reactstrap';
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
  const [calendarView, setCalendarView] = React.useState<CalendarProps['view']>('month');
  const largerPeriod = { month: 'year', year: 'decade', decade: 'century', century: 'century' }[calendarView];
  React.useEffect(() => {
    if (props.disabled) setCalendarView('month');
  }, [props.disabled]);

  if (!props.disabled) {
    return (
      <FormGroup tag='fieldset' className='min-w-0 space-y-2'>
        <legend className='text-sm font-semibold'>
          {props.label ? props.label : 'Set the expiration date'}
        </legend>
        <DatePicker
          className={`peaks-date-picker ${props.error?.path === 'date' ? 'peaks-date-picker--error' : ''}`}
          calendarIcon={<CalendarDaysIcon className='size-5' aria-hidden='true' />}
          calendarProps={{
            view: calendarView,
            onViewChange: ({ view }) => setCalendarView(view),
            prevAriaLabel: `Previous ${calendarView}`,
            nextAriaLabel: `Next ${calendarView}`,
            prev2AriaLabel: `Previous ${largerPeriod}`,
            next2AriaLabel: `Next ${largerPeriod}`,
            prevLabel: <ChevronLeftIcon className='mx-auto size-4' aria-hidden='true' />,
            nextLabel: <ChevronRightIcon className='mx-auto size-4' aria-hidden='true' />,
            prev2Label: <ChevronDoubleLeftIcon className='mx-auto size-4' aria-hidden='true' />,
            next2Label: <ChevronDoubleRightIcon className='mx-auto size-4' aria-hidden='true' />
          }}
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
          <div className='text-sm text-error'>{props.error.message}</div>
        )}
      </FormGroup>
    );
  }
  return <AssetSummary fields={[[props.label || 'Expiration date',
    props.date ? DateUtil.formatExpiration(props.date) : null]]} />;
};

export default AssignDate;
