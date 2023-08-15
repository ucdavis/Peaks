import * as React from 'react';
import { useContext, useState } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { IKeyInfo } from '../../models/Keys';
import SearchAsyncOptions from '../Shared/SearchAsyncOptions';

interface IProps {
  defaultKeyInfo?: IKeyInfo;
  onSelect: (keyInfo: IKeyInfo) => void;
  onDeselect: () => void;
  allowNew: boolean;
}

interface IState {
  isSearchLoading: boolean;
  keysInfo: IKeyInfo[];
}

const noopTrue = () => {
  return true;
};

// Search for existing key then send selection back to parent
const SearchKeys = (props: IProps) => {
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [keysInfo, setKeysInfo] = useState<IKeyInfo[]>([]);
  const context = useContext(Context);

  const { defaultKeyInfo } = props;

  const renderItem = (option: IKeyInfo, propsData, index) => {
    return (
      <div>
        <div>
          <Highlighter search={propsData.text}>{option.key.name}</Highlighter>
        </div>
        <div>
          <small>
            Key Code:
            <Highlighter search={propsData.text}>{option.key.code}</Highlighter>
          </small>
        </div>
      </div>
    );
  };

  const onSearch = async query => {
    const { team } = context;

    setIsSearchLoading(true);

    let keysInfo: IKeyInfo[] = null;
    try {
      keysInfo = await context.fetch(
        `/api/${team.slug}/keys/search?q=${query}`
      );
    } catch (err) {
      toast.error('Error searchhing keys.');
      setIsSearchLoading(false);
      return;
    }

    setKeysInfo(keysInfo);
    setIsSearchLoading(false);
  };

  const onChange = (selected: any[]) => {
    let keyInfo: IKeyInfo;

    // check for empty
    if (!selected || selected.length <= 0) {
      props.onDeselect();
    }

    // check for new selection
    if (selected[0].customOption) {
      keyInfo = {
        id: 0,
        key: {
          code: selected[0].code,
          id: 0,
          name: '',
          notes: '',
          serials: [],
          tags: '',
          teamId: 0
        },
        serialsInUseCount: 0,
        serialsTotalCount: 0,
        spacesCount: 0
      };
    } else {
      keyInfo = selected[0];
    }

    props.onSelect(keyInfo);
    return;
  };

  return (
    <SearchAsyncOptions
      id='searchKeys' // for accessibility
      defaultSelected={defaultKeyInfo ? [defaultKeyInfo] : []}
      isLoading={isSearchLoading}
      minLength={2}
      placeholder='Search for key by name or by serial number'
      labelKey='code'
      allowNew={props.allowNew}
      renderMenuItemChildren={renderItem}
      onSearch={onSearch}
      onChange={onChange}
      options={keysInfo}
    />
  );
};

export default SearchKeys;
