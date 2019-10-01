import * as PropTypes from 'prop-types';
import * as React from 'react';
import { RouteChildrenProps } from 'react-router';
import { toast } from 'react-toastify';
import {
  AppContext,
  IEquipment,
  IMatchParams,
  IPerson,
  ISpace
} from '../../Types';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import AssignEquipment from './AssignEquipment';
import DeleteEquipment from './DeleteEquipment';
import EditEquipment from './EditEquipment';
import EquipmentDetails from './EquipmentDetails';
import EquipmentList from './EquipmentList';
import EquipmentTableContainer from './EquipmentTableContainer';
import RevokeEquipment from './RevokeEquipment';

interface IState {
  commonAttributeKeys: string[];
  equipmentTypes: string[];
  equipment: IEquipment[]; // either equipment assigned to this person, or all team equipment
  loading: boolean;
  tags: string[];
  equipmentProtectionLevels: string[];
  equipmentAvailabilityLevels: string[];
}

interface IProps extends RouteChildrenProps<IMatchParams> {
  assetInUseUpdated?: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  assetTotalUpdated?: (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => void;
  assetEdited?: (type: string, spaceId: number, personId: number) => void;
  person?: IPerson;
  space?: ISpace;
}

export default class EquipmentContainer extends React.Component<
  IProps,
  IState
> {
  public static contextTypes = {
    fetch: PropTypes.func,
    permissions: PropTypes.array,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      commonAttributeKeys: [],
      equipment: [],
      equipmentAvailabilityLevels: ['A1', 'A2', 'A3', 'A4'],
      equipmentProtectionLevels: ['P1', 'P2', 'P3', 'P4'],
      equipmentTypes: [],
      loading: true,
      tags: []
    };
  }
  public async componentDidMount() {
    if (!PermissionsUtil.canViewEquipment(this.context.permissions)) {
      return;
    }
    // are we getting the person's equipment or the team's?
    let equipmentFetchUrl = '';
    if (!!this.props.person) {
      equipmentFetchUrl = `/api/${this.context.team.slug}/equipment/listassigned?personid=${this.props.person.id}`;
    } else if (!!this.props.space) {
      equipmentFetchUrl = `/api/${this.context.team.slug}/equipment/getEquipmentInSpace?spaceId=${this.props.space.id}`;
    } else {
      equipmentFetchUrl = `/api/${this.context.team.slug}/equipment/list/`;
    }
    let equipment: IEquipment[] = null;
    try {
      equipment = await this.context.fetch(equipmentFetchUrl);
    } catch (e) {
      toast.error(
        'Failed to fetch equipment. Please refresh the page to try again.'
      );
      return;
    }
    // TODO: move all this into context
    const attrFetchUrl = `/api/${this.context.team.slug}/equipment/commonAttributeKeys/`;

    const commonAttributeKeys = await this.context.fetch(attrFetchUrl);

    const equipmentTypeFetchUrl = `/api/${this.context.team.slug}/equipment/ListEquipmentTypes/`;

    const equipmentTypes = await this.context.fetch(equipmentTypeFetchUrl);

    const tags = await this.context.fetch(
      `/api/${this.context.team.slug}/tags/listTags`
    );

    this.setState({
      commonAttributeKeys,
      equipment,
      equipmentTypes,
      loading: false,
      tags
    });
  }
  public render() {
    if (!PermissionsUtil.canViewEquipment(this.context.permissions)) {
      return <Denied viewName='Equipment' />;
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    const { action, assetType, id } = this.props.match.params;
    const activeAsset = !assetType || assetType === 'equipment';
    const selectedId = parseInt(id, 10);
    const detailEquipment = this.state.equipment.find(e => e.id === selectedId);
    return (
      <div className='card equipment-color'>
        <div className='card-header-equipment'>
          <div className='card-head row justify-content-between'>
            <h2>
              <i className='fas fa-hdd fa-xs' /> Equipment
            </h2>
            <AssignEquipment
              onCreate={this._createAndMaybeAssignEquipment}
              modal={
                activeAsset && (action === 'create' || action === 'assign')
              }
              onAddNew={this._openCreateModal}
              closeModal={this._closeModals}
              selectedEquipment={detailEquipment}
              person={this.props.person}
              space={this.props.space}
              tags={this.state.tags}
              commonAttributeKeys={this.state.commonAttributeKeys}
              openDetailsModal={this._openDetailsModal}
              openEditModal={this._openEditModal}
              equipmentTypes={this.state.equipmentTypes}
            />
          </div>
        </div>
        <div className='card-content'>
          {this._renderTableOrList()}
          <EquipmentDetails
            selectedEquipment={detailEquipment}
            modal={activeAsset && action === 'details' && !!detailEquipment}
            closeModal={this._closeModals}
            openEditModal={this._openEditModal}
            openUpdateModal={this._openAssignModal}
            updateSelectedEquipment={this._updateEquipmentFromDetails}
          />
          <EditEquipment
            selectedEquipment={detailEquipment}
            onEdit={this._editEquipment}
            closeModal={this._closeModals}
            openUpdateModal={this._openAssignModal}
            modal={activeAsset && action === 'edit'}
            tags={this.state.tags}
            space={this.props.space}
            commonAttributeKeys={this.state.commonAttributeKeys}
            equipmentTypes={this.state.equipmentTypes}
          />
          <RevokeEquipment
            selectedEquipment={detailEquipment}
            revokeEquipment={this._revokeEquipment}
            closeModal={this._closeModals}
            openEditModal={this._openEditModal}
            openUpdateModal={this._openAssignModal}
            modal={activeAsset && action === 'revoke'}
          />
          <DeleteEquipment
            selectedEquipment={detailEquipment}
            deleteEquipment={this._deleteEquipment}
            closeModal={this._closeModals}
            openEditModal={this._openEditModal}
            openUpdateModal={this._openAssignModal}
            modal={activeAsset && action === 'delete'}
          />
        </div>
      </div>
    );
  }

  private _renderTableOrList = () => {
    if (!!this.props.person || !!this.props.space) {
      return (
        <div>
          <EquipmentList
            equipment={this.state.equipment}
            onRevoke={this._openRevokeModal}
            onDelete={this._openDeleteModal}
            onAdd={this._openAssignModal}
            showDetails={this._openDetailsModal}
            onEdit={this._openEditModal}
          />
        </div>
      );
    } else {
      return (
        <div>
          <EquipmentTableContainer
            equipment={this.state.equipment}
            tags={this.state.tags}
            equipmentAvailabilityLevels={this.state.equipmentAvailabilityLevels}
            equipmentProtectionLevels={this.state.equipmentProtectionLevels}
            equipmentTypes={this.state.equipmentTypes}
            openRevokeModal={this._openRevokeModal}
            openDeleteModal={this._openDeleteModal}
            openAssignModal={this._openAssignModal}
            openDetailsModal={this._openDetailsModal}
            openEditModal={this._openEditModal}
          />
        </div>
      );
    }
  };

  private _createAndMaybeAssignEquipment = async (
    person: IPerson,
    equipment: IEquipment,
    date: any
  ) => {
    let updateTotalAssetCount = false;
    let updateInUseAssetCount = false;

    const attributes = equipment.attributes;
    // call API to create a equipment, then assign it if there is a person to assign to
    // if we are creating a new equipment
    if (equipment.id === 0) {
      equipment.teamId = this.context.team.id;
      try {
        equipment = await this.context.fetch(
          `/api/${this.context.team.slug}/equipment/create`,
          {
            body: JSON.stringify(equipment),
            method: 'POST'
          }
        );
        toast.success('Equipment created successfully!');
      } catch (e) {
        toast.error('Error creating equipment.');
        throw new Error(); // throw error so modal doesn't close
      }
      equipment.attributes = attributes;
      updateTotalAssetCount = true;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${this.context.team.slug}/equipment/assign?equipmentId=${equipment.id}&personId=${person.id}&date=${date}`;

      if (!equipment.assignment) {
        // don't count as assigning unless this is a new one
        updateInUseAssetCount = true;
      }
      try {
        equipment = await this.context.fetch(assignUrl, {
          method: 'POST'
        });
        toast.success('Equipment assigned successfully!');
      } catch (e) {
        toast.error('Error assigning equipment.');
        throw new Error(); // throw error so modal doesn't close
      }
      equipment.attributes = attributes;
      equipment.assignment.person = person;
    }

    const index = this.state.equipment.findIndex(x => x.id === equipment.id);
    if (index !== -1) {
      // update already existing entry in equipment
      const updateEquipment = [...this.state.equipment];
      updateEquipment[index] = equipment;

      this.setState({
        ...this.state,
        equipment: updateEquipment
      });
    } else if (
      !!this.props.space &&
      !!equipment.space &&
      this.props.space.id !== equipment.space.id
    ) {
      // if we are on the space tab and we have assigned/created an equipment that is not in this space, do nothing to our state here
    } else {
      this.setState({
        equipment: [...this.state.equipment, equipment]
      });
    }

    if (updateTotalAssetCount && this.props.assetTotalUpdated) {
      this.props.assetTotalUpdated(
        'equipment',
        this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null,
        1
      );
    }
    if (updateInUseAssetCount && this.props.assetInUseUpdated) {
      this.props.assetInUseUpdated(
        'equipment',
        this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null,
        1
      );
    }
  };

  private _revokeEquipment = async (equipment: IEquipment) => {
    if (!confirm('Are you sure you want to revoke item?')) {
      return false;
    }
    // call API to actually revoke
    try {
      const removed: IEquipment = await this.context.fetch(
        `/api/${this.context.team.slug}/equipment/revoke/${equipment.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Equipment revoked successfully!');
    } catch (e) {
      toast.error('Error revoking equipment.');
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = this.state.equipment.indexOf(equipment);
    if (index > -1) {
      const shallowCopy = [...this.state.equipment];
      if (!this.props.person) {
        // if we are looking at all equipment, just update assignment
        shallowCopy[index].assignment = null;
        shallowCopy[index].equipmentAssignmentId = null;
      } else {
        // if we are looking at a person, remove from our list of equipment
        shallowCopy.splice(index, 1);
      }
      this.setState({ equipment: shallowCopy });
      if (this.props.assetInUseUpdated) {
        this.props.assetInUseUpdated(
          'equipment',
          this.props.space ? this.props.space.id : null,
          this.props.person ? this.props.person.id : null,
          -1
        );
      }
    }
  };

  private _deleteEquipment = async (equipment: IEquipment) => {
    if (!confirm('Are you sure you want to delete item?')) {
      return false;
    }

    try {
      const deleted: IEquipment = await this.context.fetch(
        `/api/${this.context.team.slug}/equipment/delete/${equipment.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Equipment deleted successfully!');
    } catch (e) {
      toast.error('Error deleting equipment.');
      throw new Error(); // throw error so modal doesn't close
    }

    // remove from state
    const index = this.state.equipment.indexOf(equipment);
    if (index > -1) {
      const shallowCopy = [...this.state.equipment];
      shallowCopy.splice(index, 1);
      this.setState({ equipment: shallowCopy });

      if (equipment.assignment !== null && this.props.assetInUseUpdated) {
        this.props.assetInUseUpdated(
          'equipment',
          this.props.space ? this.props.space.id : null,
          this.props.person ? this.props.person.id : null,
          -1
        );
      }
      if (this.props.assetTotalUpdated) {
        this.props.assetTotalUpdated(
          'equipment',
          this.props.space ? this.props.space.id : null,
          this.props.person ? this.props.person.id : null,
          -1
        );
      }
    }
  };

  private _editEquipment = async (equipment: IEquipment) => {
    const index = this.state.equipment.findIndex(x => x.id === equipment.id);

    if (index === -1) {
      // should always already exist
      return;
    }

    let updated: IEquipment = null;
    try {
      updated = await this.context.fetch(
        `/api/${this.context.team.slug}/equipment/update`,
        {
          body: JSON.stringify(equipment),
          method: 'POST'
        }
      );
      toast.success('Equipment updated successfully!');
    } catch (e) {
      toast.error('Error editing equipment.');
      throw new Error(); // throw error so modal doesn't close
    }

    updated.assignment = equipment.assignment;

    // update already existing entry in key
    const updateEquipment = [...this.state.equipment];
    updateEquipment[index] = updated;

    // if on space tab and the space has been edited
    if (
      !!this.props.space &&
      equipment.space.id !== this.state.equipment[index].space.id
    ) {
      // remove one from total of old space
      this.props.assetTotalUpdated(
        'equipment',
        this.state.equipment[index].space.id,
        this.props.person ? this.props.person.id : null,
        -1
      );
      // remove from this state
      updateEquipment.splice(index, 1);
      // and add one to total of new space
      this.props.assetTotalUpdated(
        'equipment',
        equipment.space.id,
        this.props.person ? this.props.person.id : null,
        1
      );
    }

    this.setState({
      ...this.state,
      equipment: updateEquipment
    });

    if (this.props.assetEdited) {
      this.props.assetEdited(
        'equipment',
        this.props.space ? this.props.space.id : null,
        this.props.person ? this.props.person.id : null
      );
    }
  };

  private _updateEquipmentFromDetails = (
    equipment: IEquipment,
    id?: number
  ) => {
    const equipmentId = equipment ? equipment.id : id;
    const index = this.state.equipment.findIndex(x => x.id === equipmentId);

    if (index === -1) {
      // should always already exist
      return;
    }

    // update already existing entry in key
    const updateEquipment = [...this.state.equipment];
    // if equipment has been deleted elsewhere
    if (equipment === null) {
      updateEquipment.splice(index, 1);
    } else {
      updateEquipment[index] = equipment;
    }

    this.setState({ ...this.state, equipment: updateEquipment });
  };

  private _openAssignModal = (equipment: IEquipment) => {
    this.props.history.push(
      `${this._getBaseUrl()}/equipment/assign/${equipment.id}`
    );
  };

  private _openCreateModal = () => {
    this.props.history.push(`${this._getBaseUrl()}/equipment/create`);
  };

  private _openDetailsModal = (equipment: IEquipment) => {
    // if we are on spaces page, and this equipment is not assigned to this space
    // this happens on the search
    if (this.state.equipment.findIndex(x => x.id === equipment.id) === -1) {
      this.props.history.push(
        `/${this.context.team.slug}/equipment/details/${equipment.id}`
      );
    } else {
      this.props.history.push(
        `${this._getBaseUrl()}/equipment/details/${equipment.id}`
      );
    }
  };

  private _openEditModal = (equipment: IEquipment) => {
    this.props.history.push(
      `${this._getBaseUrl()}/equipment/edit/${equipment.id}`
    );
  };

  private _openRevokeModal = (equipment: IEquipment) => {
    this.props.history.push(
      `${this._getBaseUrl()}/equipment/revoke/${equipment.id}`
    );
  };

  private _openDeleteModal = (equipment: IEquipment) => {
    this.props.history.push(
      `${this._getBaseUrl()}/equipment/delete/${equipment.id}`
    );
  };

  private _closeModals = () => {
    this.props.history.push(`${this._getBaseUrl()}/equipment`);
  };

  private _getBaseUrl = () => {
    if (!!this.props.person) {
      return `/${this.context.team.slug}/people/details/${this.props.person.id}`;
    } else if (!!this.props.space) {
      return `/${this.context.team.slug}/spaces/details/${this.props.space.id}`;
    } else {
      return `/${this.context.team.slug}`;
    }
  };
}
