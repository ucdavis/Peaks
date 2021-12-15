import * as React from 'react';
import { useContext, useState } from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IEquipment, IEquipmentLabel } from '../../models/Equipment';
import { ISpace } from '../../models/Spaces';

interface IProps {
  onDeselect: () => void;
  onSelect: (equipment: IEquipment) => void;
  openDetailsModal: (equipment: IEquipment) => void;
  selectedEquipment?: IEquipment;
  space: ISpace; // used to set default space if we are on spaces tab
}

// Search for existing equipment then send selection back to parent
const SearchEquipment = (props: IProps) => {
  const [equipment, setEquipment] = useState<IEquipmentLabel[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const context = useContext(Context);

  const renderSelectEquipment = () => {
    return (
      <div>
        <label>Pick an equipment to assign</label>
        <div>
          <AsyncTypeahead
            id='searchEquipment' // for accessibility
            isLoading={isSearchLoading}
            minLength={3}
            placeholder='Search for equipment by name or by serial number'
            labelKey='label'
            filterBy={() => true} // don't filter on top of our search
            allowNew={false}
            renderMenuItemChildren={(option, props, index) => (
              <div className={!!option.equipment.assignment ? 'disabled' : ''}>
                <div>
                  <Highlighter key='equipment.name' search={props.text}>
                    {option.equipment.name}
                  </Highlighter>
                </div>
                <div>
                  {!!option.equipment.assignment ? 'Assigned' : 'Unassigned'}
                </div>
                <div>
                  <small>
                    Serial Number:
                    <Highlighter
                      key='equipment.serialNumber'
                      search={props.text}
                    >
                      {option.equipment.serialNumber}
                    </Highlighter>
                  </small>
                </div>
              </div>
            )}
            onSearch={onSearch}
            onChange={selected => {
              if (selected && selected.length === 1) {
                if (
                  !!selected[0].equipment &&
                  !!selected[0].equipment.assignment
                ) {
                  props.openDetailsModal(selected[0].equipment);
                } else {
                  onSelected(selected[0]);
                }
              }
            }}
            options={equipment}
          />
        </div>
        <div>or</div>
        <div>
          <Button color='link' onClick={createNew}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Create New
            Equipment
          </Button>
        </div>
      </div>
    );
  };

  const onSearch = async (query: string) => {
    setIsSearchLoading(true);
    let equipmentData: IEquipmentLabel[] = null;
    try {
      equipmentData = await context.fetch(
        `/api/${context.team.slug}/equipment/search?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching equipment.');
      setIsSearchLoading(false);
      return;
    }
    setEquipment(equipmentData);
    setIsSearchLoading(false);
  };

  const onSelected = (equipmentLabel: IEquipmentLabel) => {
    // onChange is called when deselected
    if (!equipmentLabel || !equipmentLabel.label) {
      props.onDeselect();
    } else {
      props.onSelect({
        ...equipmentLabel.equipment
      });
    }
  };

  const createNew = () => {
    props.onSelect({
      attributes: [
        {
          equipmentId: 0,
          key: '',
          value: ''
        }
      ],
      availabilityLevel: '',
      id: 0,
      make: '',
      model: '',
      name: '',
      notes: '',
      protectionLevel: '',
      serialNumber: '',
      space: props.space ? props.space : null, // if we are on spaces tab, auto to the right space
      systemManagementId: '',
      tags: '',
      teamId: 0,
      type: ''
    });
  };

  return renderSelectEquipment();
};

export default SearchEquipment;
