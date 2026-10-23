import * as React from 'react';
import { flexRender, HeaderGroup } from '@tanstack/react-table';
import { peaksFeatures } from './tableFeatures';

export const DefaultColumnFilter = ({ column }) => (
  <input
    className='input input-sm w-full min-w-24'
    aria-label={`Filter ${
      typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.id
    }`}
    placeholder='Filter…'
    value={column.getFilterValue() || ''}
    onChange={e => column.setFilterValue(e.target.value || undefined)}
  />
);

export const ColumnFilterHeaders = <T extends object>({
  headerGroups
}: {
  headerGroups: HeaderGroup<typeof peaksFeatures, T>[];
}) => (
  <>
    {headerGroups.map(group => (
      <tr className='asset-table-filters' key={group.id}>
        {group.headers.map(header => (
          <th key={header.id}>
            <div
              aria-label={`Filter ${
                typeof header.column.columnDef.header === 'string'
                  ? header.column.columnDef.header
                  : header.column.id
              }`}
            >
              {header.column.getCanFilter()
                ? flexRender(
                    header.column.columnDef.meta?.Filter || DefaultColumnFilter,
                    header.getContext()
                  )
                : null}
            </div>
          </th>
        ))}
      </tr>
    ))}
  </>
);
