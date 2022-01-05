import { addWeeks, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import * as React from 'react';
import { DateUtil } from './dates';

interface IFilterOption {
  value: string;
  displayText: string;
}

// UI for expiration column filter
export function ExpirationColumnFilter({
  column: { filterValue, setFilter }
}) {
  // Render a multi-select box
  return (
    <select
    className="form-control"
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

// custom filter filter function for expirations
export function expirationFilter(rows: any[], id, filterValue) {
  if (filterValue === 'all') {
    return rows;
  }
  if (filterValue === 'unassigned') {
    return rows.filter(r => !getRowExpiresAt(r));
  }
  if (filterValue === 'expired') {
    return rows.filter(
      r =>
        !!getRowExpiresAt(r) &&
        !isAfter(new Date(getRowExpiresAt(r)), new Date())
    );
  }
  if (filterValue === 'unexpired') {
    return rows.filter(
      r =>
        !!getRowExpiresAt(r) &&
        isAfter(new Date(getRowExpiresAt(r)), new Date())
    );
  }
  if (filterValue === '3weeks') {
    return rows.filter(
      r =>
        !!getRowExpiresAt(r) &&
        isAfter(new Date(getRowExpiresAt(r)), new Date()) &&
        isBefore(
          new Date(getRowExpiresAt(r)),
          addWeeks(startOfDay(new Date()), 3)
        )
    );
  }
  if (filterValue === '6weeks') {
    return rows.filter(
      r =>
        !!getRowExpiresAt(r) &&
        isAfter(new Date(getRowExpiresAt(r)), new Date()) &&
        isBefore(
          new Date(getRowExpiresAt(r)),
          addWeeks(startOfDay(new Date()), 6)
        )
    );
  }
  return rows;
}

// row expiration is either the date of the soonest expiration if there are multiple, or just the expiration value if it exists
const getRowExpiresAt = (row: any) =>
  row.original.assignments
    ? DateUtil.getFirstExpiration(
        row.original.assignments.map(y => y.expiresAt)
      )
    : row.original.assignment?.expiresAt;

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

  public static filter = ReactTableExpirationUtil.getFilter(
    ReactTableExpirationUtil.defaultFilterOptions
  );

  public static filterMethod(filter, row) {
    if (filter.value === 'all') {
      return true;
    }
    if (filter.value === 'unassigned') {
      return !row.expiresAt;
    }
    if (filter.value === 'expired') {
      return !!row.expiresAt && !isAfter(new Date(row.expiresAt), new Date());
    }
    if (filter.value === 'unexpired') {
      return !!row.expiresAt && isAfter(new Date(row.expiresAt), new Date());
    }
    if (filter.value === '3weeks') {
      return (
        !!row.expiresAt &&
        isAfter(new Date(row.expiresAt), new Date()) &&
        isBefore(new Date(row.expiresAt), addWeeks(startOfDay(new Date()), 3))
      );
    }
    if (filter.value === '6weeks') {
      return (
        !!row.expiresAt &&
        isAfter(new Date(row.expiresAt), new Date()) &&
        isBefore(new Date(row.expiresAt), addWeeks(startOfDay(new Date()), 6))
      );
    }
  }

  public static getFilter(options: IFilterOption[]) {
    return (filter, onChange) => {
      return (
        <select
        className="form-control"
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%' }}
          value={filter ? filter.value : 'all'}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.displayText}
            </option>
          ))}
        </select>
      );
    };
  }

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
}
