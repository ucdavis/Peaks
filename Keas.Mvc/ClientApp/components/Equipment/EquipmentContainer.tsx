import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IEquipment, IEquipmentAttribute, IPerson } from "../../Types";

import AssignEquipment from "./AssignEquipment";
import EquipmentList from "./EquipmentList";

interface IState {
    loading: boolean;
    equipment: IEquipment[];
}

export default class EquipmentContainer extends React.Component<{}, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object,
    team: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
        equipment: [],
      loading: true
    };
  }
  public async componentDidMount() {
    // are we getting the person's equipment or the team's?
      const equipmentFetchUrl = this.context.person
          ? `/equipment/listassigned/${this.context.person.id}&${this.context.person.teamId}`
      : `/equipment/list/${this.context.team.id}`;

    const equipment = await this.context.fetch(equipmentFetchUrl);
    this.setState({ equipment , loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
      }
    const assignedEquipmentList = this.context.person ? this.state.equipment.map(x => x.name) : null;
    const allEquipmentList = this.context.person ? null : this.state.equipment;
    return (
      <div className="card">
        <div className="card-body">
                <h4 className="card-title">Equipment</h4>
                <EquipmentList equipment={this.state.equipment} onRevoke={this._revokeEquipment} />
                <AssignEquipment onCreate={this._createAndMaybeAssignEquipment} />
        </div>
      </div>
    );
  }
  public _createAndMaybeAssignEquipment = async (equipment: IEquipment, person: IPerson) => {
    // call API to create a equipment, then assign it if there is a person to assign to

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
      const assignUrl = `/equipment/assign?equipmentId=${equipment.id}&personId=${
        person.id
      }`;

      equipment = await this.context.fetch(assignUrl, {
        method: "POST"
      });
    }

    this.setState({
        equipment: [...this.state.equipment, equipment]
    });

    return equipment;
  };

  public _revokeEquipment = async (equipment: IEquipment) => {
      //remove from state
      const index = this.state.equipment.indexOf(equipment);
      if (index > -1) {
        const shallowCopy = [...this.state.equipment];
        shallowCopy.splice(index, 1);
        this.setState({ equipment: shallowCopy });
      }

      // call API to actually revoke

      const removed: IEquipment = await this.context.fetch("/equipment/revoke", {
          body: JSON.stringify(equipment),
          method: "POST"
      });

      //if looking at all equipment, add back as unassigned
      if (this.context.person == null) {
          this.setState({
              equipment: [...this.state.equipment, removed]
          });
      }
  }
}
