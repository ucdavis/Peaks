import * as React from 'react';
import { useState } from 'react';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IValidationError } from '../../models/Shared';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

interface IProps {
  selectedKey: IKey;
  disableEditing: boolean;
  searchableTags?: string[];
  error?: IValidationError;
  changeProperty?: (property: string, value: string) => void;
}

const KeyEditValues = (props: IProps) => {
  const [name, setName] = useState<string>(props.selectedKey.name);
  const [code, setCode] = useState<string>(props.selectedKey.code);
  const [tags, setTags] = useState<string>(props.selectedKey.tags);
  const [notes, setNotes] = useState<string>(props.selectedKey.notes);
  const error = props.error;
  const parsedTags = tags ? tags.split(',') : [];

  const onBlurName = () => {
    let { name } = props.selectedKey;

    // trim name
    name = name.trim();

    props.changeProperty('name', name);
    setName(name);
  };

  const onBlurCode = () => {
    let { code } = props.selectedKey;

    // trim name
    code = code.trim();

    props.changeProperty('code', code);
    setCode(code);
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.changeProperty('name', event.target.value);
    setName(event.target.value);
  };

  const onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // use upper
    value = value.toUpperCase();

    props.changeProperty('code', value);
    setCode(value);
  };

  const onChangeTags = (tags: string[]) => {
    const value = tags.join(',');

    props.changeProperty('tags', value);
    setTags(value);
  };

  return (
    <div>
      <FormGroup>
        <Label for='Name'>Name</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={name}
          onBlur={onBlurName}
          onChange={onChangeName}
          required={true}
          minLength={1}
          invalid={error && error.path === 'name'}
        />
        <FormFeedback>
          {error && error.path === 'name' && error.message}
        </FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label for='code'>Code</Label>
        <Input
          type='text'
          className='form-control'
          readOnly={props.disableEditing}
          value={code}
          onBlur={onBlurCode}
          onChange={onChangeCode}
          required={true}
          minLength={1}
          maxLength={10}
          invalid={error && error.path === 'code'}
        />
        <FormFeedback>
          {error && error.path === 'code' && error.message}
        </FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>Notes</Label>
        <Input
          type='textarea'
          className='form-control'
          readOnly={props.disableEditing}
          value={notes || ''}
          onChange={e => {
            props.changeProperty('notes', e.target.value);
            setNotes(e.target.value);
          }}
          invalid={error && error.path === 'notes'}
        />
        <FormFeedback>
          {error && error.path === 'notes' && error.message}
        </FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>Tags</Label>
        <SearchDefinedOptions
          definedOptions={props.searchableTags}
          disabled={props.disableEditing}
          selected={parsedTags}
          onSelect={onChangeTags}
          placeholder='Search for Tags'
          id='searchTagsKeyEditValues'
        />
        <FormFeedback>
          {error && error.path === 'tags' && error.message}
        </FormFeedback>
      </FormGroup>
      {error &&
      error.message && // if we have an error message
        !error.path && (
          <span className='color-unitrans'>
            {
              error.message // that does not correspond to an input
            }
          </span>
        )}
    </div>
  );
};

export default KeyEditValues;
