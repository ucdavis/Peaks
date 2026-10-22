import {
  ColumnDef,
  SortFn,
  TableState,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  constructFilterFn,
  sortFn_alphanumericCaseSensitive,
  tableFeatures
} from '@tanstack/react-table';
import type { ComponentType } from 'react';

export const withOriginalOrder = (
  sortFn: SortFn<any, any>
): SortFn<any, any> => (a, b, columnId) => {
  const result = sortFn(a, b, columnId);
  const sorting = a.table.atoms.sorting.get();
  const lastSort = sorting[sorting.length - 1];
  if (result !== 0 || lastSort.id !== columnId) {
    return result;
  }
  return (a.index - b.index) * (sorting[0].desc === lastSort.desc ? 1 : -1);
};

export const peaksFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: constructFilterFn({
      resolveDataValue: value => String(value).toLowerCase(),
      resolveFilterValue: value => String(value).toLowerCase(),
      filter: (value, filterValue) => value.includes(filterValue),
      autoRemove: value => !value
    })
  },
  sortFns: {
    alphanumeric: withOriginalOrder(sortFn_alphanumericCaseSensitive)
  },
  columnMeta: {} as { Filter?: ComponentType<any> }
});
export type PeaksColumn<T extends object> = ColumnDef<
  typeof peaksFeatures,
  T,
  any
>;
export type PeaksInitialState = Partial<TableState<typeof peaksFeatures>>;
