import { AssetActions, AssetSummary } from '../Shared/AssetSummary';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { Button } from 'reactstrap';
import { IKeySerial } from '../../models/KeySerials';
import { DateUtil } from '../../util/dates';

interface IProps {
  selectedKeySerial: IKeySerial;
  openUpdateModal: (keySerial: IKeySerial) => void;
}

const KeySerialAssignmentValues = (props: IProps) => {
  if (!props.selectedKeySerial) {
    return null;
  }

  return (
    <div>
      <div className='mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-main-border pt-6'>
        <h3 className="text-lg font-semibold">Assignment Details</h3>
        <AssetActions>
          <Button
            color='asset'
            className='btn-outline'
            size='sm'
            type='button'
            onClick={() => props.openUpdateModal(props.selectedKeySerial)}
          >
            <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' />{' '}
            {!!props.selectedKeySerial.keySerialAssignment
              ? 'Update Assignment'
              : 'Assign Key Serial'}
          </Button>
        </AssetActions>
      </div>
      <AssetSummary fields={[
        ['Assigned to', props.selectedKeySerial.keySerialAssignment?.person.name || 'Unassigned'],
        ['Expires at', props.selectedKeySerial.keySerialAssignment?.expiresAt ? DateUtil.formatExpiration(props.selectedKeySerial.keySerialAssignment.expiresAt) : null]
      ]} />
    </div>
  );
};

export default KeySerialAssignmentValues;
