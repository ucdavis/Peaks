import { addWeeks, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import * as React from 'react';

interface IFilterOption {
  value: string;
  displayText: string;
}

// will need to write custom filter
// see: https://github.com/tannerlinsley/react-table/blob/master/docs/examples/simple.md#filtering
export const ExperationFilter = ({
  column: { filterValue, setFilter, preFilteredRows, id }
}) => {
  return (
    <select
      onChange={e => setFilter(e.target.value)}
      style={{ width: '100%' }}
      value={filterValue}
    >
      {ReactTableExpirationUtil.defaultFilterOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.displayText}
        </option>
      ))}
    </select>
  );
};

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

  public static filter = ReactTableExpirationUtil.getFilter(ReactTableExpirationUtil.defaultFilterOptions);

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
