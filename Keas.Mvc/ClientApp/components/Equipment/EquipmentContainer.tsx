import PropTypes from "prop-types";
import * as React from "react";

import {
  AppContext,
  IEquipment,
  IEquipmentAttribute,
  IPerson
} from "../../Types";

import AssignEquipment from "./AssignEquipment";
import EquipmentDetails from "./EquipmentDetails";
import EquipmentList from "./EquipmentList";

interface IState {
  loading: boolean;
  //either equipment assigned to this person, or all team equipment
  equipment: IEquipment[];
  selectedEquipment: IEquipment;
}

export default class EquipmentContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    router: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      equipment: [],
      selectedEquipment: null,
      loading: true
    };
  }
  public async componentDidMount() {
    // are we getting the person's equipment or the team's?
    const equipmentFetchUrl = this.context.person
      ? `/equipment/listassigned?id=${this.context.person.id}&teamId=${
          this.context.person.teamId
        }`
      : `/equipment/list/${this.context.team.id}`;

    const equipment = await this.context.fetch(equipmentFetchUrl);
    this.setState({ equipment, loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    const assignedEquipmentList = this.context.person
      ? this.state.equipment.map(x => x.name)
      : null;
    const allEquipmentList = this.context.person ? null : this.state.equipment;

    const { action, id } = this.context.router.route.match.params;
    const selectedId = parseInt(id, 10);
    const detailAsset = this.state.equipment.find(e => e.id === selectedId);

    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Equipment</h4>
          <EquipmentList
            equipment={this.state.equipment}
            onRevoke={this._revokeEquipment}
            onAdd={this._assignSelectedEquipment}
            showDetails={this._openDetailsModal}
          />
          <AssignEquipment
            onCreate={this._createAndMaybeAssignEquipment}
            modal={action === "create"}
            openModal={this._openAssignModal}
            closeModal={this._closeModals}
            selectedEquipment={this.state.selectedEquipment}
            selectEquipment={this._selectEquipment}
            changeProperty={this._changeSelectedEquipmentProperty}
          />
          <EquipmentDetails
            selectedEquipment={detailAsset}
            modal={action === "details" && !!detailAsset}
            closeModal={this._closeModals}
          />
        </div>
      </div>
    );
  }
  private _createAndMaybeAssignEquipment = async (
    person: IPerson,
    date: any
  ) => {
    // call API to create a equipment, then assign it if there is a person to assign to
    var equipment = this.state.selectedEquipment;
    //if we are creating a new equipment
    if (equipment.id === 0) {
      equipment.teamId = this.context.team.id;
      equipment = await this.context.fetch("/equipment/create", {
        body: JSON.stringify(equipment),
        method: "POST"
      });
    }

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/equipment/assign?equipmentId=${
        equipment.id
      }&personId=${person.id}&date=${date}`;

      equipment = await this.context.fetch(assignUrl, {
        method: "POST"
      });
    }

    let index = this.state.equipment.findIndex(x => x.id == equipment.id);
    console.log("index " + index);
    if (index !== -1) {
      console.log("changing");
      //update already existing entry in equipment
      let updateEquipment = [...this.state.equipment];
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
    const removed: IEquipment = await this.context.fetch("/equipment/revoke", {
      body: JSON.stringify(equipment),
      method: "POST"
    });

    //remove from state
    const index = this.state.equipment.indexOf(equipment);
    if (index > -1) {
      let shallowCopy = [...this.state.equipment];
      if (this.context.person == null) {
        //if we are looking at all equipment, just update assignment
        shallowCopy[index] = removed;
      } else {
        //if we are looking at a person, remove from our list of equipment
        shallowCopy.splice(index, 1);
      }
      this.setState({ equipment: shallowCopy });
    }
  };

  //pulls up assign modal from dropdown action
  private _assignSelectedEquipment = (equipment: IEquipment) => {
    this.setState({ selectedEquipment: equipment });
    this._openAssignModal();
  };

  private _openAssignModal = async () => {
    this.context.router.history.push(
      `/${this.context.team.name}/equipment/create`
    );
  };

  //used in assign equipment
  private _selectEquipment = (equipment: IEquipment) => {
    this.setState({ selectedEquipment: equipment });
  };

  private _changeSelectedEquipmentProperty = (
    property: string,
    value: string
  ) => {
    this.setState({
      selectedEquipment: {
        ...this.state.selectedEquipment,
        [property]: value
      }
    });
  };

  private _openDetailsModal = (equipment: IEquipment) => {
    this.context.router.history.push(
      `/${this.context.team.name}/equipment/details/${equipment.id}`
    );
  };

  private _closeModals = () => {
    this.context.router.history.push(
      `/${this.context.team.name}/equipment`
    );
  };
}
