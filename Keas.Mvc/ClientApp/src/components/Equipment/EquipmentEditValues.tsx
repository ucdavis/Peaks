import { AssetActions, AssetSummary } from '../Shared/AssetSummary';
import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import { InformationCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
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
  spacious?: boolean;
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

  if (props.disableEditing) {
    const equipment = props.selectedEquipment;
    return <AssetSummary title='Equipment details' fields={[
      ['Name', equipment.name], ['Type', typeValue], ['Serial number / identifier', equipment.serialNumber],
      ...(shouldShowForType(equipment.type, 'Make') ? [['Make', equipment.make] as [string, React.ReactNode], ['Model', equipment.model] as [string, React.ReactNode]] : []),
      ...(shouldShowForType(equipment.type, 'ProtectionAndAvailability') ? [['Protection level', equipment.protectionLevel] as [string, React.ReactNode], ['Availability level', equipment.availabilityLevel] as [string, React.ReactNode]] : []),
      ...(shouldShowForType(equipment.type, 'SystemManagementId') ? [['Managed system ID', <span>{equipment.systemManagementId || '—'}{equipment.systemManagementId && <EquipmentManagedSystemInfo managedSystemId={equipment.systemManagementId} />}</span>] as [string, React.ReactNode]] : []),
      ['Room', equipment.space ? `${equipment.space.roomNumber} ${equipment.space.bldgName}` : null]
    ]} tags={equipment.tags} notes={equipment.notes}
      actions={props.openEditModal && <button type='button' className='btn btn-asset btn-sm' onClick={() => props.openEditModal(equipment)}>Edit Equipment</button>}>
      {equipment.attributes?.length > 0 && <AssetSummary title='Attributes'
        fields={equipment.attributes.map(attribute => [attribute.key, attribute.value])} />}
    </AssetSummary>;
  }

  return (
    <div>
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <h3 className="text-lg font-semibold">Equipment Details</h3>
        <AssetActions>
          {props.disableEditing && props.openEditModal && (
            <Button
              color='link'
              onClick={() => props.openEditModal(props.selectedEquipment)}
            >
              <PencilSquareIcon data-icon="pencil-square" className='hero-icon size-4' /> Edit Equipment
            </Button>
          )}
        </AssetActions>
      </div>

      <div className='grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0 [&>div]:mb-0 [&_label]:mb-2 [&_label]:inline-block [&_label]:text-sm [&_label]:font-semibold [&_.invalid-feedback]:text-sm [&_.invalid-feedback]:text-error'>
        <FormGroup className='space-y-2'>
          <Label for='name'>Name</Label>
          <Input
            id='name'
            type='text'
            className={`input w-full ${error?.path === 'name' ? 'input-error' : ''}`}
            readOnly={props.disableEditing}
            value={
              props.selectedEquipment.name ? props.selectedEquipment.name : ''
            }
            onChange={e => props.changeProperty('name', e.target.value)}
            invalid={error && error.path === 'name'}
          />
          <FormFeedback className='text-sm text-error'>
            {error && error.path === 'name' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup className='space-y-2'>
          <Label for='type'>Type</Label>
          <Input
            id='type'
            type='select'
            className={`select w-full ${error?.path === 'type' ? 'select-error' : ''}`}
            value={typeValue}
            onChange={e => props.changeProperty('type', e.target.value)}
            disabled={props.disableEditing}
            invalid={error && error.path === 'type'}
          >
            {listItems}
          </Input>
          <FormFeedback className='text-sm text-error'>
            {error && error.path === 'type' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup className='space-y-2'>
          <Label for='serialNumber'>Serial Number / Identifier</Label>
          <Input
            id='serialNumber'
            type='text'
            className={`input w-full ${error?.path === 'serialNumber' ? 'input-error' : ''}`}
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
          <FormFeedback className='text-sm text-error'>
            {error && error.path === 'serialNumber' && error.message}
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
            <FormGroup className='space-y-2'>
              <Label for='protectionLevel'>Protection Level</Label> <span />{' '}
              <a
                href='https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html'
                target='_blank'
                rel='noopener noreferrer'
              >
                <InformationCircleIcon data-icon="information-circle" className='hero-icon size-5' />
              </a>
              <Input
            id='protectionLevel'
                type='select'
                className={`select w-full ${error?.path === 'protectionLevel' ? 'select-error' : ''}`}
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
              <FormFeedback className='text-sm text-error'>
                {error && error.path === 'protectionLevel' && error.message}
              </FormFeedback>
            </FormGroup>
            <FormGroup className='space-y-2'>
              <Label for='availabilityLevel'>Availability Level</Label> <span />{' '}
              <a
                href='https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html'
                target='_blank'
                rel='noopener noreferrer'
              >
                <InformationCircleIcon data-icon="information-circle" className='hero-icon size-5' />
              </a>
              <Input
            id='availabilityLevel'
                type='select'
                className={`select w-full ${error?.path === 'availabilityLevel' ? 'select-error' : ''}`}
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
              <FormFeedback className='text-sm text-error'>
                {error && error.path === 'availabilityLevel' && error.message}
              </FormFeedback>
            </FormGroup>
          </>
        )}

        {shouldShowForType(props.selectedEquipment.type, 'Make') && (
          <FormGroup className='space-y-2'>
            <Label for='make'>Make</Label>
            <Input
            id='make'
              type='text'
              className={`input w-full ${error?.path === 'make' ? 'input-error' : ''}`}
              readOnly={props.disableEditing}
              value={
                props.selectedEquipment.make ? props.selectedEquipment.make : ''
              }
              onChange={e => props.changeProperty('make', e.target.value)}
              invalid={error && error.path === 'make'}
            />
            <FormFeedback className='text-sm text-error'>
              {error && error.path === 'make' && error.message}
            </FormFeedback>
          </FormGroup>
        )}
        {shouldShowForType(props.selectedEquipment.type, 'Model') && (
          <FormGroup className='space-y-2'>
            <Label for='model'>Model</Label>
            <Input
            id='model'
              type='text'
              className={`input w-full ${error?.path === 'model' ? 'input-error' : ''}`}
              readOnly={props.disableEditing}
              value={
                props.selectedEquipment.model
                  ? props.selectedEquipment.model
                  : ''
              }
              onChange={e => props.changeProperty('model', e.target.value)}
              invalid={error && error.path === 'model'}
            />
            <FormFeedback className='text-sm text-error'>
              {error && error.path === 'model' && error.message}
            </FormFeedback>
          </FormGroup>
        )}
        {shouldShowForType(
          props.selectedEquipment.type,
          'SystemManagementId'
        ) && (
          <FormGroup className='space-y-2'>
            <EquipmentManagedSystem
              managedSystemId={props.selectedEquipment.systemManagementId}
              addManagedSystemId={props.changeProperty}
              disableEditing={props.disableEditing}
            />
            <Input
              type='text'
              className={`input w-full ${error?.path === 'systemManagementId' ? 'input-error' : ''}`}
              readOnly={props.disableEditing}
              value={props.selectedEquipment.systemManagementId || ''}
              maxLength={16}
              onChange={e =>
                props.changeProperty('systemManagementId', e.target.value)
              }
              invalid={error && error.path === 'systemManagementId'}
            />
            <FormFeedback className='text-sm text-error'>
              {error && error.path === 'systemManagementId' && error.message}
            </FormFeedback>
            {props.duplicate && (
              <FormText>System Management ID is not duplicated.</FormText>
            )}
          </FormGroup>
        )}
        <FormGroup className='sm:col-span-2 lg:col-span-3'>
          <Label for='notes'>Notes</Label>
          <Input
            id='notes'
            type='textarea'
            className={`textarea min-h-28 w-full ${error?.path === 'notes' ? 'textarea-error' : ''}`}
            readOnly={props.disableEditing}
            value={props.selectedEquipment.notes || ''}
            onChange={e => props.changeProperty('notes', e.target.value)}
            invalid={error && error.path === 'notes'}
          />
          <FormFeedback className='text-sm text-error'>
            {error && error.path === 'notes' && error.message}
          </FormFeedback>
        </FormGroup>
        <div className='sm:col-span-2 lg:col-span-3'>
        <EquipmentAttributes
          spacious={props.spacious}
          updateAttributes={props.updateAttributes}
          disableEdit={props.disableEditing}
          attributes={props.selectedEquipment.attributes}
          commonKeys={props.commonAttributeKeys}
        />
        </div>

        <FormGroup className='space-y-2'>
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
          <FormFeedback className='text-sm text-error'>
            {error && error.path === 'tags' && error.message}
          </FormFeedback>
        </FormGroup>

        {props.disableEditing && (
          // if we are looking at details, or if we are assigning
          <FormGroup className='space-y-2'>
            <Label for='room'>Room</Label>
            <Input
              type='text'
              className='input w-full'
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
          <FormGroup className='space-y-2'>
            <Label for='room'>Room</Label>
            <SearchSpaces
              onSelect={selectSpace}
              defaultSpace={
                props.space ? props.space : props.selectedEquipment.space
              }
            />
            <FormFeedback className='text-sm text-error'>
              {error && error.path === 'space' && error.message}
            </FormFeedback>
          </FormGroup>
        )}
      </div>
    </div>
  );
};

export default EquipmentEditValues;
