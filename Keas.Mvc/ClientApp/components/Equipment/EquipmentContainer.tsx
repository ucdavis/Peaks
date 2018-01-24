import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IEquipment, IPerson } from "../../Types";

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
      ? `/equipment/listassigned/${this.context.person.id}`
      : `/equipment/list/${this.context.team.id}`;

    const equipment = await this.context.fetch(equipmentFetchUrl);
    this.setState({ equipment , loading: false });
  }
  public render() {
    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Equipment</h4>
          <AssignEquipment onCreate={this._createAndMaybeAssignEquipment} />
          <EquipmentList equipment={this.state.equipment} />
        </div>
      </div>
    );
  }
  public _createAndMaybeAssignEquipment = async (equipment: IEquipment, person: IPerson) => {
    // call API to create a equipment, then assign it if there is a person to assign to

    // TODO: basically all fake, make it real
    let newEquipment: IEquipment = await this.context.fetch("/equipment/create", {
      body: JSON.stringify(equipment),
      method: "POST"
    });

    // if we know who to assign it to, do it now
    if (person) {
      const assignUrl = `/equipment/assign?equipmentId=${newEquipment.id}&personId=${
        person.id
      }`;

      newEquipment = await this.context.fetch(assignUrl, {
        method: "POST"
      });
    }

    this.setState({
      equipment: [...this.state.equipment, newEquipment]
    });
  };
}
