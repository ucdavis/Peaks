import * as React from 'react';
import { useContext, useState } from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { ISpace } from '../../models/Spaces';

interface IProps {
  onSelect: (space: ISpace) => void;
  defaultSpace?: ISpace;
  isRequired?: boolean;
}

// TODO: need a way to clear out selected space
// Assign a space via search lookup, unless a space is already provided
const SearchSpaces = (props: IProps) => {
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [spaces, setSpaces] = useState<ISpace[]>([]);
  const context = useContext(Context);
  const { defaultSpace } = props;

  const renderItem = (option, propsData, index) => {
    return (
      <div>
        <div>
          {!!option.roomNumber && (
            <Highlighter key='roomNumber' search={propsData.text}>
              {option.roomNumber}
            </Highlighter>
          )}{' '}
          {!!option.bldgName && (
            <Highlighter key='bldgName' search={propsData.text}>
              {option.bldgName}
            </Highlighter>
          )}
        </div>
        {!!option.roomName && (
          <div>
            <small>
              <Highlighter key='roomName' search={propsData.text}>
                {option.roomName}
              </Highlighter>
            </small>
          </div>
        )}
      </div>
    );
  };

  const onSearch = async query => {
    setIsSearchLoading(true);
    let spaces: ISpace[] = null;
    try {
      spaces = await context.fetch(
        `/api/${context.team.slug}/spaces/searchSpaces?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching spaces.');
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(false);
    setSpaces(spaces);
  };

  const onChange = selected => {
    if (selected && selected.length === 1) {
      props.onSelect(selected[0]);
      return;
    }

    props.onSelect(null);
  };

  return (
    <AsyncTypeahead
      id='searchSpaces' // for accessibility
      isInvalid={props.isRequired && !props.defaultSpace}
      clearButton={true}
      isLoading={isSearchLoading}
      minLength={2}
      placeholder='Search for space'
      defaultSelected={defaultSpace ? [defaultSpace] : []}
      labelKey={(option: ISpace) => `${option.roomNumber} ${option.bldgName}`}
      filterBy={() => true}
      renderMenuItemChildren={renderItem}
      onSearch={onSearch}
      onChange={onChange}
      options={spaces}
    />
  );
};

export default SearchSpaces;
