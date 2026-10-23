import { PencilSquareIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { Button } from 'reactstrap';
import { IWorkstation } from '../../models/Workstations';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedWorkstation: IWorkstation;
  openUpdateModal: (workstation: IWorkstation) => void;
}

const WorkstationAssignmentValues = (props: IProps) => {
  if (!props.selectedWorkstation) {
    return null;
  }

  return (
    <div>
      <div className='mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-main-border pt-6'>
        <h3 className="text-lg font-semibold">Assignment Details</h3>
        <Button
          color='link'
          onClick={() => props.openUpdateModal(props.selectedWorkstation)}
        >
          <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' />{' '}
          {!!props.selectedWorkstation.assignment
            ? 'Update Assignment'
            : 'Assign Workstation'}
        </Button>
      </div>

      <div className='grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0 [&>div]:mb-0 [&_label]:mb-2 [&_label]:inline-block [&_label]:text-sm [&_label]:font-semibold [&>div:has(textarea)]:col-span-full'>
        <div className='form-group'>
          <label>Assigned To</label>
          <input
            type='text'
            className='input w-full'
            disabled={true}
            value={
              !!props.selectedWorkstation.assignment
                ? props.selectedWorkstation.assignment.person.name
                : ''
            }
          />
        </div>
        <div className='form-group'>
          <label>Expires at</label>
          <input
            type='text'
            className='input w-full'
            disabled={true}
            value={
              !!props.selectedWorkstation.assignment
                ? DateUtil.formatExpiration(
                    props.selectedWorkstation.assignment.expiresAt
                  )
                : ''
            }
          />
        </div>
      </div>
    </div>
  );
};

export default WorkstationAssignmentValues;
