import * as React from 'react';
import { useContext, useState } from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess } from '../../models/Access';

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
          <AsyncTypeahead
            id='searchAccesses' // for accessibility
            isLoading={isSearchLoading}
            minLength={3}
            placeholder='Search for access by name or by serial number'
            labelKey='name'
            filterBy={() => true} // don't filter on top of our search
            allowNew={false}
            renderMenuItemChildren={(option, propsData, index) => (
              <div>
                <Highlighter key='name' search={propsData.text}>
                  {option.name}
                </Highlighter>
              </div>
            )}
            onSearch={onSearch}
            onChange={selected => {
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
