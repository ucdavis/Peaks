import * as React from 'react';
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IEquipment, IEquipmentAttribute } from '../../models/Equipment';
import { IValidationError } from '../../models/Shared';
import { ISpace } from '../../Types';
import SearchSpaces from '../Spaces/SearchSpaces';
import SearchTags from '../Tags/SearchTags';
import EquipmentAttributes from './EquipmentAttributes';
import EquipmentBigFix from './EquipmentBigFix';

interface IProps {
  changeProperty?: (property: string, value: any) => void;
  commonAttributeKeys?: string[];
  equipmentTypes?: string[];
  disableEditing: boolean;
  selectedEquipment: IEquipment;
  space?: ISpace;
  tags?: string[];
  updateAttributes?: (attribute: IEquipmentAttribute[]) => void;
  openEditModal?: (equipment: IEquipment) => void; // if disableEditing is true, this needs to be supplied
  error?: IValidationError;
}

export default class EquipmentEditValues extends React.Component<IProps, {}> {
  public render() {
    const typeValue = this.props.selectedEquipment.type || 'Default';
    const listItems = !!this.props.equipmentTypes ? (
      this.props.equipmentTypes.map(x => (
        <option value={x} key={x}>
          {x}
        </option>
      ))
    ) : (
      <option value={typeValue}>{typeValue}</option>
    );
    const error = this.props.error;
    return (
      <div>
        {this.props.disableEditing && this.props.openEditModal && (
          <div className='row justify-content-between'>
            <h3>Equipment Details</h3>
            <Button
              color='link'
              onClick={() =>
                this.props.openEditModal(this.props.selectedEquipment)
              }
            >
              <i className='fas fa-edit fa-xs' /> Edit Equipment
            </Button>
          </div>
        )}

        <div className='wrapperasset'>
          <FormGroup>
            <Label for='Name'>Name</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={this.props.disableEditing}
              value={
                this.props.selectedEquipment.name
                  ? this.props.selectedEquipment.name
                  : ''
              }
              onChange={e => this.props.changeProperty('name', e.target.value)}
              invalid={error && error.path === 'name'}
            />
            <FormFeedback>
              {error && error.path === 'name' && error.message}
            </FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for='type'>Type</Label>
            <Input
              type='select'
              className='form-control'
              value={typeValue}
              onChange={e => this.props.changeProperty('type', e.target.value)}
              disabled={this.props.disableEditing}
              invalid={error && error.path === 'type'}
            >
              {listItems}
            </Input>
            <FormFeedback>
              {error && error.path === 'type' && error.message}
            </FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for='serialNumber'>Serial Number / Identifier</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={this.props.disableEditing}
              autoFocus={
                !this.props.disableEditing &&
                this.props.selectedEquipment.name !== ''
              }
              value={
                this.props.selectedEquipment.serialNumber
                  ? this.props.selectedEquipment.serialNumber
                  : ''
              }
              onChange={e =>
                this.props.changeProperty('serialNumber', e.target.value)
              }
              invalid={error && error.path === 'serialNumber'}
            />
            <FormFeedback>
              {error && error.path === 'name' && error.message}
            </FormFeedback>
          </FormGroup>
          {this._shouldShowForType(
            this.props.selectedEquipment.type,
            'ProtectionAndAvailability'
          ) && (
            <>
              <FormGroup>
                <Label for='protectionLevel'>Protection Level</Label> <span />{' '}
                <a
                  href='https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <i className='fas fa-info-circle' />
                </a>
                <Input
                  type='select'
                  className='form-control'
                  value={this.props.selectedEquipment.protectionLevel || ''}
                  onChange={e =>
                    this.props.changeProperty('protectionLevel', e.target.value)
                  }
                  disabled={this.props.disableEditing}
                  invalid={error && error.path === 'protectionLevel'}
                >
                  <option value='P1'>P1 - Minimal</option>
                  <option value='P2'>P2 - Low</option>
                  <option value='P3'>P3 - Moderate</option>
                  <option value='P4'>P4 - High</option>
                </Input>
                <FormFeedback>
                  {error && error.path === 'protectionLevel' && error.message}
                </FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for='availabilityLevel'>Availability Level</Label>{' '}
                <span />{' '}
                <a
                  href='https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <i className='fas fa-info-circle' />
                </a>
                <Input
                  type='select'
                  className='form-control'
                  value={this.props.selectedEquipment.availabilityLevel || ''}
                  onChange={e =>
                    this.props.changeProperty(
                      'availabilityLevel',
                      e.target.value
                    )
                  }
                  disabled={this.props.disableEditing}
                  invalid={error && error.path === 'availabilityLevel'}
                >
                  <option value='A1'>A1 - Minimal</option>
                  <option value='A2'>A2 - Low</option>
                  <option value='A3'>A3 - Moderate</option>
                  <option value='A4'>A4 - High</option>
                </Input>
                <FormFeedback>
                  {error && error.path === 'availabilityLevel' && error.message}
                </FormFeedback>
              </FormGroup>
            </>
          )}

          {this._shouldShowForType(
            this.props.selectedEquipment.type,
            'Make'
          ) && (
            <FormGroup>
              <Label for='make'>Make</Label>
              <Input
                type='text'
                className='form-control'
                readOnly={this.props.disableEditing}
                value={
                  this.props.selectedEquipment.make
                    ? this.props.selectedEquipment.make
                    : ''
                }
                onChange={e =>
                  this.props.changeProperty('make', e.target.value)
                }
                invalid={error && error.path === 'make'}
              />
              <FormFeedback>
                {error && error.path === 'make' && error.message}
              </FormFeedback>
            </FormGroup>
          )}
          {this._shouldShowForType(
            this.props.selectedEquipment.type,
            'Model'
          ) && (
            <FormGroup>
              <Label for='model'>Model</Label>
              <Input
                type='text'
                className='form-control'
                readOnly={this.props.disableEditing}
                value={
                  this.props.selectedEquipment.model
                    ? this.props.selectedEquipment.model
                    : ''
                }
                onChange={e =>
                  this.props.changeProperty('model', e.target.value)
                }
                invalid={error && error.path === 'model'}
              />
              <FormFeedback>
                {error && error.path === 'model' && error.message}
              </FormFeedback>
            </FormGroup>
          )}
          {this._shouldShowForType(
            this.props.selectedEquipment.type,
            'SystemManagementId'
          ) && (
            <FormGroup>
              <EquipmentBigFix
                bigfixId={this.props.selectedEquipment.systemManagementId}
                addBigFixId={this.props.changeProperty}
                disableEditing={this.props.disableEditing}
              />
              <Input
                type='text'
                className='form-control'
                readOnly={this.props.disableEditing}
                value={this.props.selectedEquipment.systemManagementId || ''}
                maxLength={16}
                onChange={e =>
                  this.props.changeProperty(
                    'systemManagementId',
                    e.target.value
                  )
                }
                invalid={error && error.path === 'systemManagementId'}
              />
              <FormFeedback>
                {error && error.path === 'systemManagementId' && error.message}
              </FormFeedback>
            </FormGroup>
          )}
          <FormGroup>
            <Label for='notes'>Notes</Label>
            <Input
              type='textarea'
              className='form-control'
              readOnly={this.props.disableEditing}
              value={this.props.selectedEquipment.notes || ''}
              onChange={e => this.props.changeProperty('notes', e.target.value)}
              invalid={error && error.path === 'notes'}
            />
            <FormFeedback>
              {error && error.path === 'notes' && error.message}
            </FormFeedback>
          </FormGroup>
          <EquipmentAttributes
            updateAttributes={this.props.updateAttributes}
            disableEdit={this.props.disableEditing}
            attributes={this.props.selectedEquipment.attributes}
            commonKeys={this.props.commonAttributeKeys}
          />

          <FormGroup>
            <Label for='tags'>Tags</Label>
            <SearchTags
              tags={this.props.tags}
              disabled={this.props.disableEditing}
              selected={
                !!this.props.selectedEquipment.tags
                  ? this.props.selectedEquipment.tags.split(',')
                  : []
              }
              onSelect={e => this.props.changeProperty('tags', e.join(','))}
            />
            <FormFeedback>
              {error && error.path === 'tags' && error.message}
            </FormFeedback>
          </FormGroup>

          {this.props.disableEditing && (
            // if we are looking at details, or if we are assigning
            <FormGroup>
              <Label for='room'>Room</Label>
              <Input
                type='text'
                className='form-control'
                readOnly={true}
                value={
                  this.props.selectedEquipment.space
                    ? `${this.props.selectedEquipment.space.roomNumber} ${this.props.selectedEquipment.space.bldgName}`
                    : ''
                }
              />
            </FormGroup>
          )}
          {!this.props.disableEditing && (
            // if we are editing or creating
            <FormGroup>
              <Label for='room'>Room</Label>
              <SearchSpaces
                onSelect={this._selectSpace}
                defaultSpace={
                  this.props.space
                    ? this.props.space
                    : this.props.selectedEquipment.space
                }
              />
              <FormFeedback>
                {error && error.path === 'space' && error.message}
              </FormFeedback>
            </FormGroup>
          )}
        </div>
      </div>
    );
  }

  private _selectSpace = (space: ISpace) => {
    this.props.changeProperty('space', space);
  };

  private _shouldShowForType(type: string, prop: string) {
    if (prop === 'Make') {
      if (type !== 'Card' && type !== 'Software') {
        return true;
      }
      return false;
    }
    if (prop === 'Model') {
      if (type !== 'Card' && type !== 'Software') {
        return true;
      }
      return false;
    }
    if (prop === 'ProtectionAndAvailability') {
      const types = [
        'Computer',
        'Desktop',
        'Laptop',
        'Server',
        'Cellphone',
        'Device',
        'Tablet'
      ];
      if (types.indexOf(type) > -1) {
        return true;
      }
      return false;
    }

    if (prop === 'SystemManagementId') {
      const types = ['Computer', 'Desktop', 'Laptop', 'Server'];
      if (types.indexOf(type) > -1) {
        return true;
      }
      return false;
    }

    return true;
  }
}
