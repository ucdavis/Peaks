import * as React from 'react';
import { flexRender, HeaderGroup } from '@tanstack/react-table';
import { peaksFeatures } from './tableFeatures';

export const DefaultColumnFilter = ({ column }) => (
  <input
    className='form-control'
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
      <tr key={group.id}>
        {group.headers.map(header => (
          <th key={header.id}>
            <div>
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
