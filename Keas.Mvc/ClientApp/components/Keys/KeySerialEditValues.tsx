import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';
import { IValidationError } from '../../models/Shared';

interface IProps {
  keySerial: IKeySerial;
  disableEditing: boolean;
  changeProperty?: (property: string, value: string) => void;
  openEditModal?: (keySerial: IKeySerial) => void;
  statusList?: string[];
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
  error?: IValidationError;
}

export default class KeySerialEditValues extends React.Component<IProps, {}> {
  public render() {
    const { keySerial, error } = this.props;

    const numberValue = keySerial ? keySerial.number : '';
    const statusValue = keySerial ? keySerial.status : 'Active';

    const listItems = !!this.props.statusList ? (
      this.props.statusList.map(x => (
        <option value={x} key={x}>
          {x}
        </option>
      ))
    ) : (
      <option value={statusValue}>{statusValue}</option>
    );

    return (
      <div>
        {this.props.disableEditing && this.props.openEditModal && (
          <div className='row justify-content-between'>
            <h3>Key Details</h3>
            <Button
              color='link'
              onClick={() => this.props.openEditModal(keySerial)}
            >
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
              value={
                this.props.keySerial.key.name
                  ? this.props.keySerial.key.name
                  : ''
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for='key.code'>Key Code</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={true}
              value={this.props.keySerial.key.code}
            />
          </FormGroup>
          {this.props.goToKeyDetails && (
            <Button color='link' onClick={() => this._goToKeyDetails()}>
              <i className='fas fa-link fa-xs' /> View Key Details
            </Button>
          )}
          <FormGroup>
            <Label for='number'>Key Serial Number</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={this.props.disableEditing}
              value={numberValue}
              onChange={this.onChangeNumber}
              onBlur={this.onBlurNumber}
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
              onChange={this.onChangeStatus}
              readOnly={this.props.disableEditing}
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
              disabled={this.props.disableEditing}
              value={this.props.keySerial.notes || ''}
              onChange={e => this.props.changeProperty('notes', e.target.value)}
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
  }

  private onBlurNumber = () => {
    let value = this.props.keySerial.number;
    value = value.trim();

    this.props.changeProperty('number', value);
  };

  private onChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.changeProperty('number', event.target.value);
  };

  private onChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.changeProperty('status', event.target.value);
  };

  private _goToKeyDetails = () => {
    if (!this.props.keySerial || !this.props.keySerial.key) {
      return;
    }
    this.props.goToKeyDetails(this.props.keySerial.key);
  };
}
