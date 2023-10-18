import * as React from 'react';
import {
  Button,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label
} from 'reactstrap';
import { IEquipment, IEquipmentAttribute } from '../../models/Equipment';
import { IValidationError } from '../../models/Shared';
import { ISpace } from '../../models/Spaces';
import SearchSpaces from '../Spaces/SearchSpaces';
import EquipmentAttributes from './EquipmentAttributes';
import EquipmentManagedSystem from './EquipmentManagedSystem';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

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
  duplicate?: boolean;
}

const EquipmentEditValues = (props: IProps) => {
  const typeValue = props.selectedEquipment.type || 'Default';
  const listItems = !!props.equipmentTypes ? (
    props.equipmentTypes.map(x => (
      <option value={x} key={x}>
        {x}
      </option>
    ))
  ) : (
    <option value={typeValue}>{typeValue}</option>
  );
  const error = props.error;

  const selectSpace = (space: ISpace) => {
    props.changeProperty('space', space);
  };

  const shouldShowForType = (type: string, prop: string) => {
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
  };

  return (
    <div>
      <div className='row justify-content-between'>
        <h3>Equipment Details</h3>
        {props.disableEditing && props.openEditModal && (
          <Button
            color='link'
            onClick={() => props.openEditModal(props.selectedEquipment)}
          >
            <i className='fas fa-edit fa-xs' /> Edit Equipment
          </Button>
        )}
      </div>

      <div className='wrapperasset'>
        <FormGroup>
          <Label for='Name'>Name</Label>
          <Input
            type='text'
            className='form-control'
            readOnly={props.disableEditing}
            value={
              props.selectedEquipment.name ? props.selectedEquipment.name : ''
            }
            onChange={e => props.changeProperty('name', e.target.value)}
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
            onChange={e => props.changeProperty('type', e.target.value)}
            disabled={props.disableEditing}
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
            readOnly={props.disableEditing}
            autoFocus={
              !props.disableEditing && props.selectedEquipment.name !== ''
            }
            value={
              props.selectedEquipment.serialNumber
                ? props.selectedEquipment.serialNumber
                : ''
            }
            onChange={e => props.changeProperty('serialNumber', e.target.value)}
            invalid={error && error.path === 'serialNumber'}
          />
          <FormFeedback>
            {error && error.path === 'name' && error.message}
          </FormFeedback>
          {props.duplicate && (
            <FormText>Serial Number is not duplicated.</FormText>
          )}
        </FormGroup>
        {shouldShowForType(
          props.selectedEquipment.type,
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
                value={props.selectedEquipment.protectionLevel || ''}
                onChange={e =>
                  props.changeProperty('protectionLevel', e.target.value)
                }
                disabled={props.disableEditing}
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
              <Label for='availabilityLevel'>Availability Level</Label> <span />{' '}
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
                value={props.selectedEquipment.availabilityLevel || ''}
                onChange={e =>
                  props.changeProperty('availabilityLevel', e.target.value)
                }
                disabled={props.disableEditing}
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

        {shouldShowForType(props.selectedEquipment.type, 'Make') && (
          <FormGroup>
            <Label for='make'>Make</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={props.disableEditing}
              value={
                props.selectedEquipment.make ? props.selectedEquipment.make : ''
              }
              onChange={e => props.changeProperty('make', e.target.value)}
              invalid={error && error.path === 'make'}
            />
            <FormFeedback>
              {error && error.path === 'make' && error.message}
            </FormFeedback>
          </FormGroup>
        )}
        {shouldShowForType(props.selectedEquipment.type, 'Model') && (
          <FormGroup>
            <Label for='model'>Model</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={props.disableEditing}
              value={
                props.selectedEquipment.model
                  ? props.selectedEquipment.model
                  : ''
              }
              onChange={e => props.changeProperty('model', e.target.value)}
              invalid={error && error.path === 'model'}
            />
            <FormFeedback>
              {error && error.path === 'model' && error.message}
            </FormFeedback>
          </FormGroup>
        )}
        {shouldShowForType(
          props.selectedEquipment.type,
          'SystemManagementId'
        ) && (
          <FormGroup>
            <EquipmentManagedSystem
              managedSystemId={props.selectedEquipment.systemManagementId}
              addManagedSystemId={props.changeProperty}
              disableEditing={props.disableEditing}
            />
            <Input
              type='text'
              className='form-control'
              readOnly={props.disableEditing}
              value={props.selectedEquipment.systemManagementId || ''}
              maxLength={16}
              onChange={e =>
                props.changeProperty('systemManagementId', e.target.value)
              }
              invalid={error && error.path === 'systemManagementId'}
            />
            <FormFeedback>
              {error && error.path === 'systemManagementId' && error.message}
            </FormFeedback>
            {props.duplicate && (
              <FormText>System Management ID is not duplicated.</FormText>
            )}
          </FormGroup>
        )}
        <FormGroup>
          <Label for='notes'>Notes</Label>
          <Input
            type='textarea'
            className='form-control'
            readOnly={props.disableEditing}
            value={props.selectedEquipment.notes || ''}
            onChange={e => props.changeProperty('notes', e.target.value)}
            invalid={error && error.path === 'notes'}
          />
          <FormFeedback>
            {error && error.path === 'notes' && error.message}
          </FormFeedback>
        </FormGroup>
        <EquipmentAttributes
          updateAttributes={props.updateAttributes}
          disableEdit={props.disableEditing}
          attributes={props.selectedEquipment.attributes}
          commonKeys={props.commonAttributeKeys}
        />

        <FormGroup>
          <Label for='tags'>Tags</Label>
          <SearchDefinedOptions
            definedOptions={props.tags}
            disabled={props.disableEditing}
            selected={
              !!props.selectedEquipment.tags
                ? props.selectedEquipment.tags.split(',')
                : []
            }
            onSelect={e => props.changeProperty('tags', e.join(','))}
            placeholder='Search for Tags'
            id='searchTagsEquipmentEditValues'
          />
          <FormFeedback>
            {error && error.path === 'tags' && error.message}
          </FormFeedback>
        </FormGroup>

        {props.disableEditing && (
          // if we are looking at details, or if we are assigning
          <FormGroup>
            <Label for='room'>Room</Label>
            <Input
              type='text'
              className='form-control'
              readOnly={true}
              value={
                props.selectedEquipment.space
                  ? `${props.selectedEquipment.space.roomNumber} ${props.selectedEquipment.space.bldgName}`
                  : ''
              }
            />
          </FormGroup>
        )}
        {!props.disableEditing && (
          // if we are editing or creating
          <FormGroup>
            <Label for='room'>Room</Label>
            <SearchSpaces
              onSelect={selectSpace}
              defaultSpace={
                props.space ? props.space : props.selectedEquipment.space
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
};

export default EquipmentEditValues;
