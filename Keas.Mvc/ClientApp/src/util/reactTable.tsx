import { addWeeks, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import * as React from 'react';
import { DateUtil } from './dates';

export interface IFilterOption {
  value: string;
  displayText: string;
}

export class ReactTableExpirationUtil {
  public static defaultFilterOptions: IFilterOption[] = [
    {
      displayText: 'Show All',
      value: 'all'
    },
    {
      displayText: 'Unassigned',
      value: 'unassigned'
    },
    {
      displayText: 'Expired',
      value: 'expired'
    },
    {
      displayText: 'All Unexpired',
      value: 'unexpired'
    },
    {
      displayText: 'Expiring within 3 weeks',
      value: '3weeks'
    },
    {
      displayText: 'Expiring within 6 weeks',
      value: '6weeks'
    }
  ];

  public static sortMethod(a, b) {
    if (!b) {
      return -1;
    }
    if (!a) {
      return 1;
    }
    if (isSameDay(new Date(a), new Date(b))) {
      return 0;
    } else {
      return isBefore(new Date(a), new Date(b)) ? -1 : 1;
    }
  }
  public static getRowExpiresAt = (row: any) => {
    if (!!row.original.assignments) {
      // if on AccessTable, get soonest expiration date
      return DateUtil.getFirstExpiration(
        row.original.assignments.map(y => y.expiresAt)
      );
    }
    if (!!row.original.expiresAt) {
      // if on AccessAssignmentTable (it does not have .assignment property, it is the assignment itself)
      return row.original.expiresAt;
    }
    if (!!row.original.keySerialAssignment) {
      // KeySerialTable
      return row.original.keySerialAssignment?.expiresAt;
    }
    // EquipmentTable
    return row.original.assignment?.expiresAt;
    // filtering for KeyTable is handled in KeyTable.tsx
  };

  // custom filter function for expirations
  public static filterFunction(rows: any[], id, filterValue) {
    if (filterValue === 'all') {
      return rows;
    }
    if (filterValue === 'unassigned') {
      return rows.filter(r => !ReactTableExpirationUtil.getRowExpiresAt(r));
    }
    if (filterValue === 'expired') {
      return rows.filter(
        r =>
          !!ReactTableExpirationUtil.getRowExpiresAt(r) &&
          !isAfter(
            new Date(ReactTableExpirationUtil.getRowExpiresAt(r)),
            new Date()
          )
      );
    }
    if (filterValue === 'unexpired') {
      return rows.filter(
        r =>
          !!ReactTableExpirationUtil.getRowExpiresAt(r) &&
          isAfter(
            new Date(ReactTableExpirationUtil.getRowExpiresAt(r)),
            new Date()
          )
      );
    }
    if (filterValue === '3weeks') {
      return rows.filter(
        r =>
          !!ReactTableExpirationUtil.getRowExpiresAt(r) &&
          isAfter(
            new Date(ReactTableExpirationUtil.getRowExpiresAt(r)),
            new Date()
          ) &&
          isBefore(
            new Date(ReactTableExpirationUtil.getRowExpiresAt(r)),
            addWeeks(startOfDay(new Date()), 3)
          )
      );
    }
    if (filterValue === '6weeks') {
      return rows.filter(
        r =>
          !!ReactTableExpirationUtil.getRowExpiresAt(r) &&
          isAfter(
            new Date(ReactTableExpirationUtil.getRowExpiresAt(r)),
            new Date()
          ) &&
          isBefore(
            new Date(ReactTableExpirationUtil.getRowExpiresAt(r)),
            addWeeks(startOfDay(new Date()), 6)
          )
      );
    }
    return rows;
  }
  public static FilterHeader({ column: { filterValue, setFilter } }) {
    // Render a multi-select box
    return (
      <select
        className='form-control'
        value={filterValue}
        style={{ width: '100%' }}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
      >
        {ReactTableExpirationUtil.defaultFilterOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.displayText}
          </option>
        ))}
      </select>
    );
  }
}

export class ReactTableNumberOfAssignmentsUtil {
  public static FilterHeader = ({ column: { filterValue, setFilter } }) => {
    // filterValue will be something like ['<', '15'] or ['=', '3'] or ['>', '5']
    // defaults to '='
    return (
      <div className='row justify-content-between'>
        <select
          className='form-control'
          value={(filterValue as [string, string])?.[0] ?? '='}
          style={{ width: '30%' }}
          onChange={e =>
            setFilter((old: [string, string]) => [e.target.value, old?.[1]])
          }
        >
          <option key='less-than' value='<'>
            {`<`}
          </option>
          <option key='equals' value='='>
            {`=`}
          </option>
          <option key='greater-than' value='>'>
            {`>`}
          </option>
        </select>
        <input
          className='form-control'
          style={{ width: '70%' }}
          value={(filterValue as [string, string])?.[1] ?? ''}
          onChange={e =>
            setFilter((old: [string, string]) => [old?.[0], e.target.value])
          }
        />
      </div>
    );
  };

  // custom filter function for number of assignments
  public static filterFunction = (
    rows: any[],
    id,
    filterValue: [string, string]
  ) => {
    if (filterValue?.[0] === '<' && !!filterValue?.[1]) {
      return rows.filter(
        r => Number(r.values.numAssignments) < Number(filterValue?.[1])
      );
    }
    if ((!filterValue?.[0] || filterValue?.[0] === '=') && !!filterValue?.[1]) {
      // default to equals
      return rows.filter(
        r => Number(r.values.numAssignments) === Number(filterValue?.[1])
      );
    }
    if (filterValue?.[0] === '>' && !!filterValue?.[1]) {
      return rows.filter(
        r => Number(r.values.numAssignments) > Number(filterValue?.[1])
      );
    }
    return rows;
  };
}
