import { AssetActions, AssetSummary, DisplayField } from '../Shared/AssetSummary';
import { LinkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';
import { IPerson } from '../../models/People';
import { IValidationError } from '../../models/Shared';

interface IProps {
  keySerial: IKeySerial;
  person?: IPerson;
  disableEditing: boolean;
  statusList?: string[];
  error?: IValidationError;
  changeProperty?: (property: string, value: string) => void;
  openEditModal?: (keySerial: IKeySerial) => void;
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
}

const KeySerialEditValues = (props: IProps) => {
  const { keySerial, error } = props;

  const numberValue = keySerial ? keySerial.number : '';
  const statusValue = keySerial ? keySerial.status : 'Active';

  const listItems = !!props.statusList ? (
    props.statusList.map(x => (
      <option value={x} key={x}>
        {x}
      </option>
    ))
  ) : (
    <option value={statusValue}>{statusValue}</option>
  );

  const onBlurNumber = () => {
    let value = props.keySerial.number;
    value = value.trim();

    props.changeProperty('number', value);
  };

  const onChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.changeProperty('number', event.target.value);
  };

  const onChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.changeProperty('status', event.target.value);
  };

  const goToKeyDetails = () => {
    if (!props.keySerial || !props.keySerial.key) {
      return;
    }
    props.goToKeyDetails(props.keySerial.key);
  };

  const renderEditKeySerial = () => {
    return !props.person ? (
      <Button color='asset' size='sm' type='button' onClick={() => props.openEditModal(keySerial)}>
        <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' /> Edit Serial
      </Button>
    ) : null;
  };

  if (props.disableEditing) {
    return <AssetSummary title='Key details' fields={[
      ['Key name', keySerial.key.name], ['Key code', keySerial.key.code],
      ['Key serial number', numberValue], ['Status', statusValue]
    ]} notes={keySerial.notes} actions={<>
      {props.openEditModal && !props.person && renderEditKeySerial()}
      {props.goToKeyDetails && <button type='button' className='btn btn-asset btn-outline btn-sm' onClick={goToKeyDetails}><LinkIcon className='size-4' aria-hidden='true' />View Key Details</button>}
    </>} />;
  }

  return (
    <div>
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <h3 className="text-lg font-semibold">Key Details</h3>
        {props.goToKeyDetails && (
          <AssetActions>
            <button type='button' className='btn btn-asset btn-outline btn-sm' onClick={goToKeyDetails}>
              <LinkIcon className='size-4' aria-hidden='true' /> View Key Details
            </button>
          </AssetActions>
        )}
      </div>
      <div className='grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0 [&>div]:mb-0 [&_label]:mb-2 [&_label]:inline-block [&_label]:text-sm [&_label]:font-semibold [&>div:has(textarea)]:col-span-full'>
        <dl><DisplayField label='Key Name'>{props.keySerial.key.name ? props.keySerial.key.name : ''}</DisplayField></dl>
        <dl><DisplayField label='Key Code'>{props.keySerial.key.code}</DisplayField></dl>
        <FormGroup>
          <Label for='number'>Key Serial Number</Label>
          <Input
            type='text'
            className='input w-full'
            readOnly={props.disableEditing}
            value={numberValue}
            onChange={onChangeNumber}
            onBlur={onBlurNumber}
            invalid={error && error.path === 'number'}
          />
          <FormFeedback>
            {error && error.path === 'number' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label>Status</Label>
          <Input
            type='select'
            className='select w-full'
            value={statusValue}
            onChange={onChangeStatus}
            disabled={props.disableEditing}
            invalid={error && error.path === 'status'}
          >
            {listItems}
          </Input>
          <FormFeedback>
            {error && error.path === 'status' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label>Notes</Label>
          <Input
            type='textarea'
            className='textarea min-h-28 w-full'
            disabled={props.disableEditing}
            value={props.keySerial.notes || ''}
            onChange={e => props.changeProperty('notes', e.target.value)}
            invalid={error && error.path === 'notes'}
          />
          <FormFeedback>
            {error && error.path === 'notes' && error.message}
          </FormFeedback>
        </FormGroup>
      </div>
      {error && error.message && !error.path && (
        <span className='text-error'>
          {
            error.message // if we have a non-specific error
          }
        </span>
      )}
    </div>
  );
};

export default KeySerialEditValues;
