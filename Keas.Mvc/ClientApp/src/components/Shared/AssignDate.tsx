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
  onValidityChange?: (valid: boolean) => void;
}

const AssignDate = (props: IProps) => {
  const anchor = React.useRef<HTMLDivElement>(null);
  const [calendarHost, setCalendarHost] = React.useState<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [calendarView, setCalendarView] = React.useState<CalendarProps['view']>('month');
  const [incomplete, setIncomplete] = React.useState(false);
  const validateDate = () => {
    const inputs = Array.from(anchor.current?.querySelectorAll<HTMLInputElement>('input[type="number"]') || []);
    const partial = inputs.some(input => input.value !== '') && inputs.some(input => input.value === '');
    inputs.forEach(input => input.setCustomValidity(partial ? 'Enter a complete date (MM/DD/YYYY) or clear all date fields.' : ''));
    setIncomplete(partial);
    props.onValidityChange?.(!partial && inputs.every(input => input.validity.valid));
  };
  React.useLayoutEffect(validateDate, [props.date, props.disabled]);
  const largerPeriod = { month: 'year', year: 'decade', decade: 'century', century: 'century' }[calendarView];
  React.useEffect(() => {
    if (props.disabled) {
      setCalendarView('month');
      setCalendarOpen(false);
    }
  }, [props.disabled]);

  React.useLayoutEffect(() => {
    if (!calendarOpen || !calendarHost || !anchor.current) return;
    const positionCalendar = () => {
      const rect = anchor.current.getBoundingClientRect();
      const modal = anchor.current.closest('.modal');
      const bounds = modal?.getBoundingClientRect();
      const topBound = Math.max(8, bounds?.top || 0);
      const bottomBound = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);
      const below = Math.max(0, bottomBound - rect.bottom - 8);
      const above = Math.max(0, rect.top - topBound - 8);
      const height = calendarHost.scrollHeight;
      const openBelow = height <= below || below >= above;
      const available = openBelow ? below : above;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - calendarHost.offsetWidth - 8));
      Object.assign(calendarHost.style, {
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
          portalContainer={calendarHost}
          onCalendarOpen={() => setCalendarOpen(true)}
          onCalendarClose={() => setCalendarOpen(false)}
          className={`peaks-date-picker ${incomplete || props.error?.path === 'date' ? 'peaks-date-picker--error' : ''}`}
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
        <div ref={setCalendarHost} className='peaks-calendar-host' />
        </div>
        {incomplete && <div className='text-sm text-error' role='alert'>Enter a complete date (MM/DD/YYYY) or clear all date fields.</div>}
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
