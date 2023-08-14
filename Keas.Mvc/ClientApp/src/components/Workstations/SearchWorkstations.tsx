import * as React from 'react';
import { useContext, useState } from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { ISpace } from '../../models/Spaces';
import { IWorkstation } from '../../models/Workstations';

interface IProps {
  selectedWorkstation?: IWorkstation;
  space: ISpace;
  onSelect: (workstation: IWorkstation) => void;
  openDetailsModal: (workstation: IWorkstation) => void;
  onDeselect: () => void;
}

// Search for existing workstation then send selection back to parent
const SearchWorkstations = (props: IProps) => {
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [workstations, setWorkstations] = useState<IWorkstation[]>([]);
  const context = useContext(Context);

  const renderSelectWorkstation = () => {
    return (
      <div>
        <label>Pick a workstation to assign</label>
        <div>
          <AsyncTypeahead
            id='searchWorkstations' // for accessibility
            isLoading={isSearchLoading}
            minLength={3}
            placeholder='Search for workstation by name or room'
            labelKey='name'
            filterBy={() => true} // don't filter on top of our search
            allowNew={false}
            renderMenuItemChildren={(option: any, propsData, index) => (
              <div className={!!option.assignment ? 'disabled' : ''}>
                <div>
                  <Highlighter key='name' search={propsData.text}>
                    {option.name}
                  </Highlighter>
                </div>
                <div>{!!option.assignment ? 'Assigned' : 'Unassigned'}</div>
                <div>
                  <small>
                    Space:
                    <Highlighter key='space.roomNumber' search={propsData.text}>
                      {option.space.roomNumber}
                    </Highlighter>
                    <Highlighter key='space.bldgName' search={propsData.text}>
                      {option.space.bldgName}
                    </Highlighter>
                  </small>
                </div>
              </div>
            )}
            onSearch={onSearch}
            onChange={(selected: any) => {
              if (selected && selected.length === 1) {
                if (!!selected[0] && !!selected[0].assignment) {
                  props.openDetailsModal(selected[0]);
                } else {
                  onSelected(selected[0]);
                }
              }
            }}
            options={workstations}
          />
        </div>
        <div>or</div>
        <div>
          <Button color='link' onClick={createNew}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Create New
            Workstation
          </Button>
        </div>
      </div>
    );
  };

  const onSearch = async (query: string) => {
    const searchUrl = props.space
      ? `/api/${context.team.slug}/workstations/searchInSpace?spaceId=${props.space.id}&q=`
      : `/api/${context.team.slug}/workstations/search?q=`;

    setIsSearchLoading(true);
    let newWorkstations: IWorkstation[] = null;
    try {
      newWorkstations = await context.fetch(searchUrl + query);
    } catch (err) {
      toast.error('Error searching workstations.');
      setIsSearchLoading(false);
      return;
    }
    setWorkstations(newWorkstations);
    setIsSearchLoading(false);
  };

  const renderExistingWorkstation = () => {
    return (
      <input
        type='text'
        className='form-control'
        value={props.selectedWorkstation.name}
        disabled={true}
      />
    );
  };

  const onSelected = (workstation: IWorkstation) => {
    // onChange is called when deselected
    if (!workstation || !workstation.name) {
      props.onDeselect();
    } else {
      // if teamId is not set, this is a new workstation
      props.onSelect(workstation);
    }
  };

  const createNew = () => {
    props.onSelect({
      id: 0,
      name: '',
      notes: '',
      space: props.space ? props.space : null, // if we are on spaces tab, auto to the right space
      tags: '',
      teamId: 0
    });
  };

  if (props.selectedWorkstation != null) {
    return renderExistingWorkstation();
  } else {
    return renderSelectWorkstation();
  }
};

export default SearchWorkstations;
