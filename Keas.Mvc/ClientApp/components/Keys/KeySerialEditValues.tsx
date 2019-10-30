import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';

interface IProps {
  keySerial: IKeySerial;
  disableEditing: boolean;
  changeProperty?: (property: string, value: string) => void;
  openEditModal?: (keySerial: IKeySerial) => void;
  statusList?: string[];
  goToKeyDetails?: (key: IKey) => void; // will only be supplied from person container
}

export default class KeySerialEditValues extends React.Component<IProps, {}> {
  public render() {
    const { keySerial } = this.props;

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
          <div className='form-group'>
            <label>Key Name</label>
            <input
              type='text'
              className='form-control'
              disabled={true}
              value={
                this.props.keySerial.key.name
                  ? this.props.keySerial.key.name
                  : ''
              }
            />
          </div>
          <div className='form-group'>
            <label>Key Code</label>
            <input
              type='text'
              className='form-control'
              disabled={true}
              value={this.props.keySerial.key.code}
            />
          </div>
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
              disabled={this.props.disableEditing}
              value={numberValue}
              onChange={this.onChangeNumber}
              onBlur={this.onBlurNumber}
              invalid={!numberValue || numberValue.length > 64}
            />
            <FormFeedback>Serial Number is required</FormFeedback>
          </FormGroup>
          <div className='form-group'>
            <label>Status</label>
            <select
              className='form-control'
              value={statusValue}
              onChange={this.onChangeStatus}
              disabled={this.props.disableEditing}
            >
              {listItems}
            </select>
          </div>
          <div className='form-group'>
            <label>Notes</label>
            <textarea
              className='form-control'
              disabled={this.props.disableEditing}
              value={this.props.keySerial.notes || ''}
              onChange={e => this.props.changeProperty('notes', e.target.value)}
            />
          </div>
        </div>
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

  private onChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.changeProperty('status', event.target.value);
  };

  private _goToKeyDetails = () => {
    if (!this.props.keySerial || !this.props.keySerial.key) {
      return;
    }
    this.props.goToKeyDetails(this.props.keySerial.key);
  };
}
