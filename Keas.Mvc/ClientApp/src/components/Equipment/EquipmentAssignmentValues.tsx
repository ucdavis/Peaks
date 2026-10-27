import { AssetActions } from '../Shared/AssetSummary';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipment } from '../../models/Equipment';
import { DateUtil } from '../../util/dates';

interface IProps {
  spacious?: boolean;
  selectedEquipment: IEquipment;
  openUpdateModal: (equipment: IEquipment) => void;
}

const EquipmentAssignmentValues = (props: IProps) => {
  if (!props.selectedEquipment) {
    return null;
  }

  return (
    <div className={props.spacious ? 'border-t border-main-border pt-6' : undefined}>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h3 className="text-lg font-semibold">Assignment Details</h3>
        <AssetActions>
          <Button
            color='link'
            onClick={() => props.openUpdateModal(props.selectedEquipment)}
          >
            <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' />{' '}
            {!!props.selectedEquipment.assignment
              ? 'Update Assignment'
              : 'Assign Equipment'}
          </Button>
        </AssetActions>
      </div>
      {(
        <dl className='grid gap-5 sm:grid-cols-2'>
          <div>
            <dt className='text-sm text-base-content/60'>Assigned to</dt>
            <dd className='mt-1 break-words'>{props.selectedEquipment.assignment?.person.name || 'Unassigned'}</dd>
          </div>
          <div>
            <dt className='text-sm text-base-content/60'>Expires at</dt>
            <dd className='mt-1'>{props.selectedEquipment.assignment?.expiresAt
              ? DateUtil.formatExpiration(props.selectedEquipment.assignment.expiresAt) : '—'}</dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export default EquipmentAssignmentValues;
