import { AssetActions, AssetSummary } from '../Shared/AssetSummary';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { Button } from 'reactstrap';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedAccessAssignment: IAccessAssignment;
  openUpdateModal: (access: IAccessAssignment) => void;
}

const AccessAssignmentValues = (props: IProps) => {
  if (!props.selectedAccessAssignment) {
    return null;
  }

  return (
    <div>
      <div className='mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-main-border pt-6'>
        <h3 className="text-lg font-semibold">Assignment Details</h3>
        <AssetActions>
          <Button
            color='link'
            onClick={() => props.openUpdateModal(props.selectedAccessAssignment)}
          >
            <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' />{' '}
            {!!props.selectedAccessAssignment
              ? 'Update Assignment'
              : 'Assign Equipment'}
          </Button>
        </AssetActions>
      </div>
      <AssetSummary fields={[
        ['Assigned to', props.selectedAccessAssignment?.person.name || 'Unassigned'],
        ['Expires at', props.selectedAccessAssignment?.expiresAt ? DateUtil.formatExpiration(props.selectedAccessAssignment.expiresAt) : null]
      ]} />
    </div>
  );
};

export default AccessAssignmentValues;
