import { AssetActions, AssetSummary } from '../Shared/AssetSummary';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
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
        <AssetActions>
          <Button
            color='link'
            onClick={() => props.openUpdateModal(props.selectedWorkstation)}
          >
            <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' />{' '}
            {!!props.selectedWorkstation.assignment
              ? 'Update Assignment'
              : 'Assign Workstation'}
          </Button>
        </AssetActions>
      </div>

      <AssetSummary fields={[
        ['Assigned to', props.selectedWorkstation.assignment?.person.name || 'Unassigned'],
        ['Expires at', props.selectedWorkstation.assignment?.expiresAt ? DateUtil.formatExpiration(props.selectedWorkstation.assignment.expiresAt) : null]
      ]} />
    </div>
  );
};

export default WorkstationAssignmentValues;
