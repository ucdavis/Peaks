import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { useTable, flexRender } from '@tanstack/react-table';
import { ColumnFilterHeaders } from './Filtering';
import { peaksFeatures, PeaksColumn, PeaksInitialState } from './tableFeatures';
import { ReactTableUtil } from '../../util/tableUtil';

export const ReactTable = <T extends object>({
  columns,
  data,
  initialState
}: {
  columns: PeaksColumn<T>[];
  data: T[];
  initialState?: PeaksInitialState;
}) => {
  const table = useTable({
    features: peaksFeatures,
    columns,
    data,
    defaultColumn: {
      filterFn: 'includesString',
      sortFn: 'alphanumeric',
      sortUndefined: false,
      sortDescFirst: false
    },
    initialState: {
      ...initialState,
      pagination: { ...initialState?.pagination, pageIndex: 0 }
    }
  });
  const headerGroups = table.getHeaderGroups();
  const page = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.state.pagination;
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  const pageCount = table.getPageCount();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const displayPage = pageCount ? pageIndex + 1 : 0;
  const gotoPage = (index: number) => {
    if (Number.isInteger(index) && index >= 0 && index < pageCount) {
      table.setPageIndex(index);
    }
  };
  const setPageSize = table.setPageSize;

  return (
    <div className='asset-table'>
      <div className='overflow-x-auto rounded-t-[calc(var(--radius-box)-1px)]'>
        <table className='table'>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr className='table-row' key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const column = header.column;
                  const sorted = column.getIsSorted();
                  const label = flexRender(
                    column.columnDef.header,
                    header.getContext()
                  );
                  const content = (
                    <>
                      {label}
                      <span className='shrink-0' aria-hidden='true'>
                        {sorted &&
                          (sorted === 'desc' ? (
                            <ArrowDownIcon
                              className='hero-icon size-4'
                              aria-hidden='true'
                            />
                          ) : (
                            <ArrowUpIcon
                              className='hero-icon size-4'
                              aria-hidden='true'
                            />
                          ))}
                      </span>
                    </>
                  );
                  return (
                    <th
                      key={header.id}
                      scope='col'
                      className={`sort-${sorted || 'none'}`}
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                          ? 'descending'
                          : undefined
                      }
                    >
                      {column.getCanSort() ? (
                        <button
                          type='button'
                          className='asset-table-sort'
                          onClick={event => {
                            const multi =
                              event.shiftKey && column.getCanMultiSort();
                            column.toggleSorting(
                              !multi && table.state.sorting.length > 1
                                ? column.getFirstSortDir() === 'desc'
                                : undefined,
                              multi
                            );
                          }}
                        >
                          {content}
                        </button>
                      ) : (
                        content
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            <ColumnFilterHeaders headerGroups={headerGroups} />
          </thead>
          <tbody>
            {page.length === 0 && (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className='py-12 text-center text-base-content/60'
                >
                  No matching records found. Try adjusting your filters.
                </td>
              </tr>
            )}
            {page.map(row => {
              return (
                <tr key={row.id}>
                  {row.getAllCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className='pagination flex flex-wrap items-center justify-between gap-4 border-t border-main-border px-4 py-4'>
        <p className='m-0 text-sm text-base-content/60' aria-live='polite'>
          {filteredCount ? pageIndex * pageSize + 1 : 0}–
          {Math.min((pageIndex + 1) * pageSize, filteredCount)} of{' '}
          {filteredCount} records
        </p>
        <div className='flex flex-wrap items-center gap-4'>
          <label className='flex items-center gap-2 text-sm'>
            Rows per page
            <select
              className='select select-sm w-20'
              value={pageSize}
              onChange={e => {
                ReactTableUtil.setPageSize(e.target.value);
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <nav
            className='flex items-center gap-1'
            aria-label='Table pagination'
          >
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              aria-label='First'
              disabled={!canPreviousPage}
              onClick={() => gotoPage(0)}
            >
              <ChevronDoubleLeftIcon className='size-4' aria-hidden='true' />
            </button>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              aria-label='Previous'
              disabled={!canPreviousPage}
              onClick={() => gotoPage(pageIndex - 1)}
            >
              <ChevronLeftIcon className='size-4' aria-hidden='true' />
            </button>
            <span className='px-2 text-sm'>
              Page{' '}
              <strong>
                {displayPage} of {pageCount}
              </strong>
            </span>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              aria-label='Next'
              disabled={!canNextPage}
              onClick={() => gotoPage(pageIndex + 1)}
            >
              <ChevronRightIcon className='size-4' aria-hidden='true' />
            </button>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              aria-label='Last'
              disabled={!canNextPage}
              onClick={() => gotoPage(pageCount - 1)}
            >
              <ChevronDoubleRightIcon className='size-4' aria-hidden='true' />
            </button>
          </nav>
          <label className='flex items-center gap-2 text-sm'>
            Go to page
            <input
              className='input input-sm w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              aria-label='Go to page'
              type='number'
              min={pageCount ? 1 : 0}
              max={pageCount}
              value={displayPage}
              disabled={!pageCount}
              onChange={e =>
                gotoPage(e.target.value ? Number(e.target.value) - 1 : 0)
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
};
