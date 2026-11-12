import { AssetSummary } from './AssetSummary';
import * as React from 'react';
import DatePicker from 'react-date-picker';
import type { CalendarProps } from 'react-calendar';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FormGroup } from 'reactstrap';
import { IValidationError } from '../../models/Shared';
import { DateUtil } from '../../util/dates';

const maxPickerDate = new Date(9999, 11, 31);

interface IProps {
  onChangeDate: (newDate: Date) => void;
  date: Date;
  isRequired: boolean;
  error?: IValidationError;
  label?: string;
  disabled?: boolean;
  showToday?: boolean;
  onValidityChange?: (valid: boolean) => void;
}

const AssignDate = (props: IProps) => {
  const anchor = React.useRef<HTMLDivElement>(null);
  const calendarPopup = React.useRef<HTMLDivElement>(null);
  const [calendarHost, setCalendarHost] = React.useState<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = React.useState<boolean>();
  const [pickerVersion, setPickerVersion] = React.useState(0);
  const [calendarView, setCalendarView] = React.useState<CalendarProps['view']>('month');
  const [dateError, setDateError] = React.useState('');
  const dateInputs = () => Array.from(anchor.current?.querySelectorAll<HTMLInputElement>('input[type="number"]') || []);
  const validateDate = () => {
    const inputs = dateInputs();
    const partial = inputs.some(input => input.value !== '') && inputs.some(input =>
      input.value === '' || (input.name === 'year' && input.value.length < 4));
    const message = props.isRequired
      ? 'Enter a complete date (MM/DD/YYYY).'
      : 'Enter a complete date (MM/DD/YYYY) or clear all date fields.';
    inputs.forEach(input => input.setCustomValidity(partial ? message : ''));
    setDateError(partial ? message : inputs.some(input => !input.validity.valid) ? 'Enter a valid date (MM/DD/YYYY).' : '');
    props.onValidityChange?.(!partial && inputs.every(input => input.validity.valid));
  };
  const resetValidation = (date = props.date) => {
    dateInputs().forEach(input => input.setCustomValidity(''));
    setDateError('');
    props.onValidityChange?.(!props.isRequired || !!date);
  };
  const changeDate = (date: Date) => {
    // Clear must also discard unfinished segments when the value is already null.
    // Keyboard clearing leaves every segment empty and does not need a remount.
    if (date === null && !props.date && dateInputs().some(input => input.value !== '')) {
      setPickerVersion(version => version + 1);
    }
    resetValidation(date);
    props.onChangeDate(date);
  };
  const changeCalendarOpen = (open: boolean) => {
    setCalendarOpen(open);
    // The picker restores a complete value on visibility changes, but preserves
    // unfinished segments when there is no value. Keep validation in sync.
    if (props.date || dateInputs().every(input => input.value === '')) resetValidation();
  };
  const selectToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    changeDate(today);
    setCalendarView('month');
    setCalendarOpen(false);
  };
  // Calendar selections and external changes replace all three typed segments.
  React.useEffect(resetValidation, [props.date, props.disabled]);
  React.useLayoutEffect(() => {
    if (pickerVersion) anchor.current?.querySelector<HTMLButtonElement>('[aria-label="Clear date"]')?.focus();
  }, [pickerVersion]);
  const largerPeriod = { month: 'year', year: 'decade', decade: 'century', century: 'century' }[calendarView];
  React.useEffect(() => {
    if (props.disabled) {
      setCalendarView('month');
      setCalendarOpen(false);
    }
  }, [props.disabled]);

  React.useLayoutEffect(() => {
    if (!calendarOpen || !calendarHost || !calendarPopup.current || !anchor.current) return;
    const popup = calendarPopup.current;
    const positionCalendar = () => {
      const rect = anchor.current.getBoundingClientRect();
      const modal = anchor.current.closest('.modal');
      const bounds = modal?.getBoundingClientRect();
      const topBound = Math.max(8, bounds?.top || 0);
      const bottomBound = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);
      const below = Math.max(0, bottomBound - rect.bottom - 8);
      const above = Math.max(0, rect.top - topBound - 8);
      const height = popup.scrollHeight;
      const openBelow = height <= below || below >= above;
      const available = openBelow ? below : above;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - popup.offsetWidth - 8));
      Object.assign(popup.style, {
        left: `${left - rect.left}px`,
        top: `${openBelow ? rect.height + 8 : -Math.min(height, available) - 8}px`,
        maxHeight: `${available}px`
      });
    };
    positionCalendar();
    window.addEventListener('resize', positionCalendar);
    window.addEventListener('scroll', positionCalendar, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(positionCalendar) : null;
    if (calendarHost.firstElementChild) observer?.observe(calendarHost.firstElementChild);
    return () => {
      window.removeEventListener('resize', positionCalendar);
      window.removeEventListener('scroll', positionCalendar, true);
      observer?.disconnect();
    };
  }, [calendarOpen, calendarHost, calendarView]);

  if (!props.disabled) {
    return (
      <FormGroup tag='fieldset' className='min-w-0 space-y-2'>
        <legend className='text-sm font-semibold'>
          {props.label ? props.label : 'Set the expiration date'}
        </legend>
        <div ref={anchor} className='peaks-date-picker relative' onChange={validateDate}>
        <DatePicker
          key={pickerVersion}
          portalContainer={calendarHost}
          isOpen={calendarOpen}
          onCalendarOpen={() => changeCalendarOpen(true)}
          onCalendarClose={() => changeCalendarOpen(false)}
          className={`peaks-date-picker ${dateError || props.error?.path === 'date' ? 'peaks-date-picker--error' : ''}`}
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
          maxDate={maxPickerDate}
          clearAriaLabel='Clear date'
          clearIcon={props.isRequired ? null : <XMarkIcon className='size-5' aria-hidden='true' />}
          value={props.date}
          onChange={date => changeDate(date as Date)}
          onInvalidChange={validateDate}
        />
        <div ref={calendarPopup} className={`peaks-calendar-host ${props.showToday ? '[&_.react-calendar]:rounded-b-none' : ''}`}>
          <div ref={setCalendarHost} />
          {calendarOpen && props.showToday && <div className='rounded-b-2xl border border-t-0 border-main-border bg-base-100 p-2'
            onMouseDown={event => event.stopPropagation()}
            onTouchStart={event => event.stopPropagation()}
            onFocus={event => event.stopPropagation()}>
            <button type='button' className='btn btn-ghost btn-sm w-full' onClick={selectToday}>Today</button>
          </div>}
        </div>
        </div>
        {dateError && <div className='text-sm text-error' role='alert'>{dateError}</div>}
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
