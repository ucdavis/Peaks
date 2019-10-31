import * as React from 'react';
import { FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { IKey } from '../../models/Keys';
import SearchTags from '../Tags/SearchTags';

interface IProps {
  selectedKey: IKey;
  disableEditing: boolean;
  changeProperty?: (property: string, value: string) => void;
  searchableTags?: string[];
  errorMessage?: string;
  errorPath?: string;
}

export default class KeyEditValues extends React.Component<IProps, {}> {
  public render() {
    const { name, code, tags } = this.props.selectedKey;

    const parsedTags = tags ? tags.split(',') : [];

    return (
      <div>
        <FormGroup>
          <Label for='Name'>Name</Label>
          <Input
            type='text'
            className='form-control'
            disabled={this.props.disableEditing}
            value={name}
            onBlur={this.onBlurName}
            onChange={this.onChangeName}
            required={true}
            minLength={1}
            invalid={this.props.errorPath === 'name'}
          />
          <FormFeedback>{this.props.errorMessage}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for='code'>Code</Label>
          <Input
            type='text'
            className='form-control'
            disabled={this.props.disableEditing}
            value={code}
            onBlur={this.onBlurCode}
            onChange={this.onChangeCode}
            required={true}
            minLength={1}
            maxLength={10}
            invalid={this.props.errorPath === 'code'}
          />
          <FormFeedback>{this.props.errorMessage}</FormFeedback>
        </FormGroup>
        <div className='form-group'>
          <label>Notes</label>
          <textarea
            className='form-control'
            disabled={this.props.disableEditing}
            value={this.props.selectedKey.notes || ''}
            onChange={e => this.props.changeProperty('notes', e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Tags</label>
          <SearchTags
            tags={this.props.searchableTags}
            disabled={this.props.disableEditing}
            selected={parsedTags}
            onSelect={this.onChangeTags}
          />
        </div>
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
