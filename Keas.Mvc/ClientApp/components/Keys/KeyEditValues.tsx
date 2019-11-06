import * as React from 'react';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import { IValidationError } from '../../models/Shared';
import SearchTags from '../Tags/SearchTags';

interface IProps {
  selectedKey: IKey;
  disableEditing: boolean;
  changeProperty?: (property: string, value: string) => void;
  searchableTags?: string[];
  error?: IValidationError;
}

export default class KeyEditValues extends React.Component<IProps, {}> {
  public render() {
    const { name, code, tags } = this.props.selectedKey;
    const error = this.props.error;
    const parsedTags = tags ? tags.split(',') : [];

    return (
      <div>
        <FormGroup>
          <Label for='Name'>Name</Label>
          <Input
            type='text'
            className='form-control'
            readOnly={this.props.disableEditing}
            value={name}
            onBlur={this.onBlurName}
            onChange={this.onChangeName}
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
            readOnly={this.props.disableEditing}
            value={code}
            onBlur={this.onBlurCode}
            onChange={this.onChangeCode}
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
            readOnly={this.props.disableEditing}
            value={this.props.selectedKey.notes || ''}
            onChange={e => this.props.changeProperty('notes', e.target.value)}
            invalid={error && error.path === 'notes'}
          />
          <FormFeedback>
            {error && error.path === 'notes' && error.message}
          </FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label>Tags</Label>
          <SearchTags
            tags={this.props.searchableTags}
            disabled={this.props.disableEditing}
            selected={parsedTags}
            onSelect={this.onChangeTags}
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
  }

  private onBlurName = () => {
    let { name } = this.props.selectedKey;

    // trim name
    name = name.trim();

    this.props.changeProperty('name', name);
  };

  private onBlurCode = () => {
    let { code } = this.props.selectedKey;

    // trim name
    code = code.trim();

    this.props.changeProperty('code', code);
  };

  private onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.changeProperty('name', event.target.value);
  };

  private onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // use upper
    value = value.toUpperCase();

    this.props.changeProperty('code', value);
  };

  private onChangeTags = (tags: string[]) => {
    const value = tags.join(',');

    this.props.changeProperty('tags', value);
  };
}
