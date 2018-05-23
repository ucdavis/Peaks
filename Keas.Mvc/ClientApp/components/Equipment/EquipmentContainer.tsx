import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IEquipment, IPerson } from "../../Types";

import AssignEquipment from "./AssignEquipment";
import EditEquipment from "./EditEquipment";
import EquipmentDetails from "./EquipmentDetails";
import EquipmentList from "./EquipmentList";
import Denied from "../Shared/Denied";

interface IState {
  commonAttributeKeys: string[];
  loading: boolean;
  equipment: IEquipment[]; // either equipment assigned to this person, or all team equipment
}

interface IProps {
  person?: IPerson;
}

export default class EquipmentContainer extends React.Component<IProps, IState> {
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
      loading: true
    };
  }
  public async componentDidMount() {
    // are we getting the person's equipment or the team's?
    const equipmentFetchUrl = this.props.person
      ? `/api/${this.context.team.name}/equipment/listassigned?personid=${this.props.person.id}`
      : `/api/${this.context.team.name}/equipment/list/`;

    const attrFetchUrl = `/api/${this.context.team.name}/equipment/commonAttributeKeys/`;

    const commonAttributeKeys = await this.context.fetch(attrFetchUrl);
    const equipment = await this.context.fetch(equipmentFetchUrl);
    this.setState({ commonAttributeKeys, equipment, loading: false });
  }
  public render() {
    const permissionArray = ['EquipMaster', 'DepartmentalAdmin', 'Admin'];
    if (!this.context.permissions.some(r => permissionArray.includes(r))) {
        return (
            <Denied viewName="Equipment" />
        );
    }

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    const { action, assetType, id } = this.context.router.route.match.params;
    const activeAsset = !assetType || assetType === "equipment";
    const selectedId = parseInt(id, 10);
    const detailEquipment = this.state.equipment.find(e => e.id === selectedId);
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Equipment</h4>
          <EquipmentList
            equipment={this.state.equipment}
            onRevoke={this._revokeEquipment}
            onAdd={this._openAssignModal}
            showDetails={this._openDetailsModal}
            onEdit={this._openEditModal}
          />
          <AssignEquipment
            onCreate={this._createAndMaybeAssignEquipment}
            modal={activeAsset && (action === "create" || action === "assign")}
            onAddNew={this._openCreateModal}
            closeModal={this._closeModals}
            selectedEquipment={detailEquipment}
            person={this.props.person}
            commonAttributeKeys={this.state.commonAttributeKeys}
          />
          <EquipmentDetails
            selectedEquipment={detailEquipment}
            modal={activeAsset && action === "details" && !!detailEquipment}
            closeModal={this._closeModals}
          />
          <EditEquipment 
            selectedEquipment={detailEquipment}
            onEdit={this._editEquipment}
            closeModal={this._closeModals}
            modal={activeAsset && (action === "edit")}
            commonAttributeKeys={this.state.commonAttributeKeys}
            />
        </div>
      </div>
    );
  }

  private _createAndMaybeAssignEquipment = async (
    person: IPerson,
    equipment: IEquipment,
    date: any
  ) => {
    const attributes = equipment.attributes;
    // call API to create a equipment, then assign it if there is a person to assign to
    // if we are creating a new equipment
    if (equipment.id === 0) {
      equipment.teamId = this.context.team.id;
      equipment = await this.context.fetch(`/api/${this.context.team.name}/equipment/create`, {
        body: JSON.stringify(equipment),
        method: "POST"
      });
      equipment.attributes = attributes;
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/api/${this.context.team.name}/equipment/assign?equipmentId=${equipment.id}&personId=${
        person.id
      }&date=${date}`;

      equipment = await this.context.fetch(assignUrl, {
        method: "POST"
      });
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
    } else {
      this.setState({
        equipment: [...this.state.equipment, equipment]
      });
    }
  };

  private _revokeEquipment = async (equipment: IEquipment) => {
    // call API to actually revoke
    const removed: IEquipment = await this.context.fetch(`/api/${this.context.team.name}/equipment/revoke`, {
      body: JSON.stringify(equipment),
      method: "POST"
    });

    // remove from state
    const index = this.state.equipment.indexOf(equipment);
    if (index > -1) {
      const shallowCopy = [...this.state.equipment];
      if (this.props.person == null) {
          // if we are looking at all equipment, just update assignment
       shallowCopy[index].assignment = null;
      } else {
        // if we are looking at a person, remove from our list of equipment
        shallowCopy.splice(index, 1);
      }
      this.setState({ equipment: shallowCopy });
    }
  };

  private _editEquipment = async (equipment: IEquipment) =>
  {
    const index = this.state.equipment.findIndex(x => x.id === equipment.id);

    if(index === -1 ) // should always already exist
    {
      return;
    }

    const updated: IEquipment = await this.context.fetch(`/api/${this.context.team.name}/equipment/update`, {
      body: JSON.stringify(equipment),
      method: "POST"
    });

    updated.assignment = equipment.assignment;

    // update already existing entry in key
    const updateEquipment = [...this.state.equipment];
    updateEquipment[index] = updated;

    this.setState({
      ...this.state,
      equipment: updateEquipment
    }); 
  }
  private _openAssignModal = (equipment: IEquipment) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/equipment/assign/${equipment.id}`
    );
  };

  private _openCreateModal = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/equipment/create`);
  };

  private _openDetailsModal = (equipment: IEquipment) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/equipment/details/${equipment.id}`
    );
  };

  private _openEditModal = (equipment: IEquipment) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/equipment/edit/${equipment.id}`
    );
  }
  private _closeModals = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/equipment`);
  };

  private _getBaseUrl = () => {
    return this.props.person
      ? `/${this.context.team.name}/person/details/${this.props.person.id}`
      : `/${this.context.team.name}`;
  };
}
