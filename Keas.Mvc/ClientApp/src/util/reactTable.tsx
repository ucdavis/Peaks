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

// AccessTable.tsx
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

// KeyTable.tsx
export class ReactTableKeySerialUtil {
  // UI for serial column filter
  public static FilterHeader = ({ column: { filterValue, setFilter } }) => {
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
        <option value='all'>Show All</option>
        <option value='unassigned'>Unassigned</option>
        <option value='assigned'>Assigned</option>
        <option value='hasSerial'>Has Serial</option>
        <option value='noSerial'>No Serial</option>
      </select>
    );
  };

  public static filterFunction = (rows: any[], id, filterValue) => {
    if (filterValue === 'all') {
      return rows;
    }
    if (filterValue === 'unassigned') {
      return rows.filter(
        r =>
          ReactTableKeySerialUtil.getRowSerialsInUse(r) <
          ReactTableKeySerialUtil.getRowSerialsTotal(r)
      );
    }
    if (filterValue === 'assigned') {
      return rows.filter(
        r => ReactTableKeySerialUtil.getRowSerialsInUse(r) > 0
      );
    }
    if (filterValue === 'hasSerial') {
      return rows.filter(
        r => ReactTableKeySerialUtil.getRowSerialsTotal(r) > 0
      );
    }
    if (filterValue === 'noSerial') {
      return rows.filter(
        r => ReactTableKeySerialUtil.getRowSerialsTotal(r) === 0
      );
    }
    return rows;
  };

  static getRowSerialsInUse = (row: any) => row.original?.serialsInUseCount;
  static getRowSerialsTotal = (row: any) => row.original?.serialsTotalCount;
}

// KeySerialTable.tsx
export class ReactTableKeyStatusUtil {
  public static FilterHeader = ({ column: { filterValue, setFilter } }) => {
    return (
      <select
        value={filterValue}
        style={{ width: '100%' }}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value='all'>Show All</option>
        <option value='active'>Active</option>
        <option value='inactive'>Inactive</option>
        <option value='special'>Special</option>
      </select>
    );
  };

  public static filterFunction = (rows: any[], id, filterValue) => {
    if (filterValue === 'all') {
      return rows;
    }
    if (filterValue === 'active') {
      return rows.filter(
        r => ReactTableKeyStatusUtil.getRowStatus(r) === 'Active'
      );
    }
    if (filterValue === 'inactive') {
      return rows.filter(
        r =>
          ReactTableKeyStatusUtil.getRowStatus(r) === 'Lost' ||
          ReactTableKeyStatusUtil.getRowStatus(r) === 'Destroyed' ||
          ReactTableKeyStatusUtil.getRowStatus(r) === 'Dog ate'
      );
    }
    if (filterValue === 'special') {
      return rows.filter(
        r => ReactTableKeyStatusUtil.getRowStatus(r) === 'Special'
      );
    }
    return rows;
  };

  static getRowStatus = (row: any) => row.original?.status;
}
