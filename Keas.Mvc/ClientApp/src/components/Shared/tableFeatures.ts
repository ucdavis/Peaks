import {
  ColumnDef,
  TableState,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  filterFns,
  sortFns,
  tableFeatures
} from '@tanstack/react-table';
import type { ComponentType } from 'react';

export const peaksFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
  columnMeta: {} as { Filter?: ComponentType<any> }
});
export type PeaksColumn<T extends object> = ColumnDef<
  typeof peaksFeatures,
  T,
  any
>;
export type PeaksInitialState = Partial<TableState<typeof peaksFeatures>>;
