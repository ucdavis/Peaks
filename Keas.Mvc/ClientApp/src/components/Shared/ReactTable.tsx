import * as React from 'react';
import { useTable, flexRender } from '@tanstack/react-table';
import { ColumnFilterHeaders } from './Filtering';
import { peaksFeatures, PeaksColumn, PeaksInitialState } from './tableFeatures';
import { PaginationItem, PaginationLink } from 'reactstrap';
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
  const pageOptions = table.getPageOptions();
  const gotoPage = table.setPageIndex;
  const nextPage = table.nextPage;
  const previousPage = table.previousPage;
  const setPageSize = table.setPageSize;

  return (
    <>
      <table className='table table-bordered table-striped'>
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
                    <span aria-hidden='true'>
                      {sorted && (
                        <i
                          className={
                            sorted === 'desc'
                              ? 'fas fa-long-arrow-alt-down'
                              : 'fas fa-long-arrow-alt-up'
                          }
                        />
                      )}
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
                        className='table-sort-button'
                        onClick={column.getToggleSortingHandler()}
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
          {page.map(row => {
            return (
              <tr className='rt-tr-group' key={row.id}>
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
      <div className='pagination justify-content-center'>
        <PaginationItem
          className='align-self-center'
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          <PaginationLink first />
        </PaginationItem>
        <PaginationItem
          className='align-self-center'
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          <PaginationLink previous />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </span>
            <span>
              | Go to page:{' '}
              <input
                className='form-control d-inline'
                type='number'
                defaultValue={pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: '100px' }}
              />
            </span>{' '}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            <select
              className='form-control'
              value={pageSize}
              onChange={e => {
                ReactTableUtil.setPageSize(e.target.value);
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>{' '}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem
          className='align-self-center'
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          <PaginationLink next />
        </PaginationItem>
        <PaginationItem
          className='align-self-center'
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          <PaginationLink last />
        </PaginationItem>
      </div>
    </>
  );
};
