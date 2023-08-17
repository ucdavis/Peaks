import * as React from 'react';
import { IEquipmentAttribute } from '../../models/Equipment';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

interface IProps {
  attribute: IEquipmentAttribute;
  commonKeys: string[];
  disabledEdit: boolean;
  index: number;
  changeProperty: (i: number, prop: string, val: string) => void;
  onRemove: (i: number) => void;
}

const EquipmentAttribute = (props: IProps) => {
  const renderTypeahead = () => {
    const style =
      !!props.attribute.value && !props.attribute.key
        ? 'form-control is-invalid'
        : 'form-control';
    return (
      <SearchDefinedOptions
        id={`attribute-${props.index}`} // for accessibility
        disabled={props.disabledEdit}
        definedOptions={props.commonKeys}
        placeholder=''
        selected={props.attribute.key ? [props.attribute.key] : []}
        onSelect={(selected: any) => {
          if (selected && selected.length === 1) {
            props.changeProperty(props.index, 'key', selected[0]);
          } else {
            props.changeProperty(props.index, 'key', null);
          }
        }}
        inputProps={{
          className: style
        }}
      />
    );
  };

  const renderDisabled = () => {
    return (
      <input
        type='text'
        className='form-control'
        disabled={props.disabledEdit}
        value={props.attribute.key}
      />
    );
  };

  return (
    <tbody>
      <tr key={`attribute-${props.index}`}>
        <td>
          {props.disabledEdit && renderDisabled()}
          {!props.disabledEdit && renderTypeahead()}
        </td>
        <td>
          <input
            type='text'
            className='form-control'
            disabled={props.disabledEdit}
            value={props.attribute.value}
            onChange={e =>
              props.changeProperty(props.index, 'value', e.target.value)
            }
          />
        </td>
        {!props.disabledEdit && (
          <td>
            <button
              type='button'
              className='btn btn-outline-danger'
              onClick={() => props.onRemove(props.index)}
            >
              <i className='fas fa-trash' />
            </button>
          </td>
        )}
      </tr>
    </tbody>
  );
};

export default EquipmentAttribute;
