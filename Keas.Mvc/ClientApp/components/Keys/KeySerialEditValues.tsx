import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';
import { IValidationError } from '../../models/Shared';

interface IProps {
  keySerial: IKeySerial;
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

  return (
    <div>
      {props.disableEditing && props.openEditModal && (
        <div className='row justify-content-between'>
          <h3>Key Details</h3>
          <Button color='link' onClick={() => props.openEditModal(keySerial)}>
            <i className='fas fa-edit fa-xs' /> Edit Serial
          </Button>
        </div>
      )}
      <div className='wrapperasset'>
        <FormGroup>
          <Label for='key.name'>Key Name</Label>
          <Input
            type='text'
            className='form-control'
            readOnly={true}
            value={props.keySerial.key.name ? props.keySerial.key.name : ''}
          />
        </FormGroup>
        <FormGroup>
          <Label for='key.code'>Key Code</Label>
          <Input
            type='text'
            className='form-control'
            readOnly={true}
            value={props.keySerial.key.code}
          />
        </FormGroup>
        {props.goToKeyDetails && (
          <Button color='link' onClick={() => goToKeyDetails()}>
            <i className='fas fa-link fa-xs' /> View Key Details
          </Button>
        )}
        <FormGroup>
          <Label for='number'>Key Serial Number</Label>
          <Input
            type='text'
            className='form-control'
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
            className='form-control'
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
            className='form-control'
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
        <span className='color-unitrans'>
          {
            error.message // if we have a non-specific error
          }
        </span>
      )}
    </div>
  );
};

export default KeySerialEditValues;
