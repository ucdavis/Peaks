import * as React from 'react';
import { Button } from 'reactstrap';
import { IEquipmentAttribute } from '../../models/Equipment';
import EquipmentAttribute from './EquipmentAttribute';

interface IProps {
  commonKeys: string[];
  disableEdit: boolean;
  attributes: IEquipmentAttribute[];
  updateAttributes: (attribute: IEquipmentAttribute[]) => void;
}

const EquipmentAttributes = (props: IProps) => {
  const onAddAttribute = () => {
    const attributes = [
      ...props.attributes,
      {
        equipmentId: 0,
        key: '',
        value: ''
      }
    ];
    props.updateAttributes(attributes);
  };

  const onEditAttribute = (i: number, prop: string, val: string) => {
    const attributes = [...props.attributes];
    attributes[i] = {
      ...attributes[i],
      [prop]: val
    };
    props.updateAttributes(attributes);
  };

  const onRemoveAttribute = (i: number) => {
    const attributes = [...props.attributes];
    attributes.splice(i, 1);

    props.updateAttributes(attributes);
  };

  const attributeList = props.attributes.map((attr, i) => (
    <EquipmentAttribute
      key={`attr-${i}`}
      disabledEdit={props.disableEdit}
      commonKeys={props.commonKeys}
      attribute={attr}
      index={i}
      changeProperty={onEditAttribute}
      onRemove={onRemoveAttribute}
    />
  ));

  return (
    <div>
      <label>Attributes</label> <span />{' '}
      <a
        href='https://computing.caes.ucdavis.edu/documentation/peaks/equipment-attribute-keys'
        target='blank'
        rel='noopener noreferrer'
      >
        <i className='fas fa-info-circle' />
      </a>
      <table className='table'>
        <thead>
          <tr>
            <td>Key</td>
            <td>Value</td>
            {!props.disableEdit && <td>Remove</td>}
          </tr>
        </thead>
        {attributeList}
        {!props.disableEdit && (
          <tfoot>
            <tr>
              <td colSpan={3}>
                <Button color='link' id='add-new' onClick={onAddAttribute}>
                  <i className='fas fa-plus fa-sm' aria-hidden='true' /> Add New
                  Attribute
                </Button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default EquipmentAttributes;
