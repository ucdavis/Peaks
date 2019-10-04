import * as React from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IEquipment, IEquipmentLabel, ISpace } from '../../Types';

interface IProps {
  onDeselect: () => void;
  onSelect: (equipment: IEquipment) => void;
  openDetailsModal: (equipment: IEquipment) => void;
  selectedEquipment?: IEquipment;
  space: ISpace; // used to set default space if we are on spaces tab
}

interface IState {
  equipment: IEquipmentLabel[];
  isSearchLoading: boolean;
}

// Search for existing equipment then send selection back to parent
export default class SearchEquipment extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props) {
    super(props);
    this.state = {
      equipment: [],
      isSearchLoading: false
    };
  }

  public render() {
    return this._renderSelectEquipment();
  }

  private _renderSelectEquipment = () => {
    return (
      <div>
        <label>Pick an equipment to assign</label>
        <div>
          <AsyncTypeahead
            id='searchEquipment' // for accessibility
            isLoading={this.state.isSearchLoading}
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
            onSearch={this._onSearch}
            onChange={selected => {
              if (selected && selected.length === 1) {
                if (
                  !!selected[0].equipment &&
                  !!selected[0].equipment.assignment
                ) {
                  this.props.openDetailsModal(selected[0].equipment);
                } else {
                  this._onSelected(selected[0]);
                }
              }
            }}
            options={this.state.equipment}
          />
        </div>
        <div>or</div>
        <div>
          <Button color='link' onClick={this._createNew}>
            <i className='fas fa-plus fa-sm' aria-hidden='true' /> Create New
            Equipment
          </Button>
        </div>
      </div>
    );
  };

  private _onSearch = async (query: string) => {
    this.setState({ isSearchLoading: true });
    let equipment: IEquipmentLabel[] = null;
    try {
      equipment = await this.context.fetch(
        `/api/${this.context.team.slug}/equipment/search?q=${query}`
      );
    } catch (err) {
      toast.error('Error searching equipment.');
      this.setState({ isSearchLoading: false });
      return;
    }
    this.setState({
      equipment,
      isSearchLoading: false
    });
  };

  private _onSelected = (equipmentLabel: IEquipmentLabel) => {
    // onChange is called when deselected
    if (!equipmentLabel || !equipmentLabel.label) {
      this.props.onDeselect();
    } else {
      this.props.onSelect({
        ...equipmentLabel.equipment
      });
    }
  };

  private _createNew = () => {
    this.props.onSelect({
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
      space: this.props.space ? this.props.space : null, // if we are on spaces tab, auto to the right space
      systemManagementId: '',
      tags: '',
      teamId: 0,
      type: ''
    });
  };
}
