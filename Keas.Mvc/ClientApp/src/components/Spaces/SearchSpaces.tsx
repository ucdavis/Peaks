import { useContext, useId, useState } from 'react';
import { SearchCombobox, Highlighter } from '../Shared/SearchCombobox';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { ISpace } from '../../models/Spaces';

interface IProps {
  // Supply an id when associating a visible label outside this component.
  id?: string;
  onSelect: (space: ISpace) => void;
  defaultSpace?: ISpace;
  isRequired?: boolean;
}

// TODO: need a way to clear out selected space
// Assign a space via search lookup, unless a space is already provided
const SearchSpaces = (props: IProps) => {
  const inputId = useId();
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [spaces, setSpaces] = useState<ISpace[]>([]);
  const context = useContext(Context);

  const renderItem = (option, propsData) => {
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
    let newSpaces: ISpace[] = null;
    try {
      newSpaces = await context.fetch(
        `/api/${context.team.slug}/spaces/searchSpaces?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching spaces.');
      setIsSearchLoading(false);
      return;
    }
    setSpaces(newSpaces);
    setIsSearchLoading(false);
  };

  const onChange = selected => {
    if (selected && selected.length === 1) {
      props.onSelect(selected[0]);
      return;
    }

    props.onSelect(null);
  };

  return (
    <SearchCombobox
      id={props.id || inputId}
      inputProps={{ 'aria-label': props.id ? undefined : 'Search for space' }}
      isInvalid={props.isRequired && !props.defaultSpace}
      clearButton={true}
      isLoading={isSearchLoading}
      minLength={2}
      placeholder='Search for space'
      defaultSelected={props.defaultSpace ? [props.defaultSpace] : []}
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
