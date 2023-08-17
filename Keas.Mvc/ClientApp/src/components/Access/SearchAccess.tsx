import * as React from 'react';
import { useContext, useState } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess } from '../../models/Access';
import SearchAsyncOptions from '../Shared/SearchAsyncOptions';

interface IProps {
  selectedAccess?: IAccess;
  onSelect: (access: IAccess) => void;
  onDeselect: () => void;
}

// Search for existing access then send selection back to parent
const SearchAccess = (props: IProps) => {
  const [accesses, setAccesses] = useState<IAccess[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const context = useContext(Context);

  const renderSelectAccess = () => {
    return (
      <div>
        <label>Pick an access to assign</label>
        <div>
          <SearchAsyncOptions
            id='searchAccesses' // for accessibility
            isLoading={isSearchLoading}
            minLength={3}
            placeholder='Search for access by name or by serial number'
            labelKey='name'
            allowNew={false}
            renderMenuItemChildren={(option: any, propsData, index) => (
              <div>
                <Highlighter key='name' search={propsData.text}>
                  {option.name}
                </Highlighter>
              </div>
            )}
            onSearch={onSearch}
            onChange={(selected: any[]) => {
              if (selected && selected.length === 1) {
                onSelected(selected[0]);
              }
            }}
            options={accesses}
          />
        </div>
        <div>or</div>
        <div>
          <Button
            color='link'
            onClick={() => {
              createNew();
            }}
          >
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Create New
            Access
          </Button>
        </div>
      </div>
    );
  };

  const onSearch = async (query: string) => {
    setIsSearchLoading(true);
    let accesses: IAccess[] = null;
    try {
      accesses = await context.fetch(
        `/api/${context.team.slug}/access/search?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching accesses.');
      setIsSearchLoading(false);
      return;
    }
    setAccesses(accesses);
    setIsSearchLoading(false);
  };

  const onSelected = (access: IAccess) => {
    // onChange is called when deselected
    if (!access || !access.name) {
      props.onDeselect();
    } else {
      props.onSelect({
        ...access
      });
    }
  };

  const createNew = () => {
    props.onSelect({
      assignments: [],
      id: 0,
      name: '',
      notes: '',
      tags: '',
      teamId: 0
    });
  };

  return renderSelectAccess();
};

export default SearchAccess;
