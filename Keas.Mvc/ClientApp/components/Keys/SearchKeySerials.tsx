import * as React from 'react';
import { useContext, useState } from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IKeySerial } from '../../models/KeySerials';

interface IProps {
  selectedKey?: IKey;
  selectedKeySerial?: IKeySerial;
  onSelect: (keySerial: IKeySerial) => void;
  onDeselect: () => void;
  openDetailsModal: (keySerial: IKeySerial) => void;
}

// Search for existing key then send selection back to parent
const SearchKeySerials = (props: IProps) => {
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [keySerials, setKeySerials] = useState<IKeySerial[]>([]);
  const context = useContext(Context);

  const renderExistingKey = () => {
    return (
      <input
        type='text'
        className='form-control'
        value={props.selectedKeySerial.number}
        disabled={true}
      />
    );
  };

  const renderSelectKey = () => {
    return (
      <div>
        <label>Pick a key serial to assign</label>
        <div>
          <AsyncTypeahead
            id='searchKeySerials' // for accessibility
            isInvalid={!props.selectedKey || !props.selectedKeySerial}
            isLoading={isSearchLoading}
            minLength={1}
            placeholder='Search for key by name or by serial number'
            labelKey='number'
            filterBy={() => true} // don't filter on top of our search
            allowNew={false}
            renderMenuItemChildren={renderItem}
            onSearch={onSearch}
            onChange={onChange}
            options={keySerials}
          />
        </div>
        <div>or</div>
        <div>
          <Button color='link' onClick={createNew}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Create New
            Serial
          </Button>
        </div>
      </div>
    );
  };

  const renderItem = (option: IKeySerial, props, index) => {
    return (
      <div className={!!option.keySerialAssignment ? 'disabled' : ''}>
        <div>
          <div>
            <Highlighter search={props.text}>{option.key.name}</Highlighter>
            <span> - </span>
            <Highlighter search={props.text}>{option.key.code}</Highlighter>
          </div>
        </div>
        <div>{!!option.keySerialAssignment ? 'Assigned' : 'Unassigned'}</div>
        <div>
          <small>
            Serial Number:
            <Highlighter key='number' search={props.text}>
              {option.number}
            </Highlighter>
          </small>
        </div>
      </div>
    );
  };

  const onSearch = async query => {
    const { team } = context;
    setIsSearchLoading(true);

    const searchUrl = props.selectedKey
      ? `/api/${team.slug}/keySerials/searchInKey?keyId=${props.selectedKey.id}&q=${query}`
      : `/api/${team.slug}/keySerials/search?q=${query}`;

    let keySerials: IKeySerial[] = null;
    try {
      keySerials = await context.fetch(searchUrl);
    } catch (err) {
      toast.error('Error searching key serials.');
      setIsSearchLoading(false);
      return;
    }
    setKeySerials(keySerials);
    setIsSearchLoading(false);
  };

  const onChange = (selected: any[]) => {
    let keySerial: IKeySerial;

    // check for empty
    if (!selected || selected.length <= 0) {
      props.onDeselect();
    }

    // check for new selection
    if (selected[0].customOption) {
      keySerial = {
        id: 0,
        key: props.selectedKey,
        notes: '',
        number: selected[0].number,
        status: 'Active'
      };
      props.onSelect(keySerial);
    } else if (!!selected[0].keySerialAssignment) {
      props.openDetailsModal(selected[0]);
    } else {
      keySerial = selected[0];
      props.onSelect(keySerial);
    }

    return;
  };

  const createNew = () => {
    const keySerial = {
      id: 0,
      key: props.selectedKey,
      notes: '',
      number: '',
      status: 'Active',
      tags: ''
    };
    props.onSelect(keySerial);
  };

  if (props.selectedKeySerial != null) {
    return renderExistingKey();
  }

  return renderSelectKey();
};

export default SearchKeySerials;
