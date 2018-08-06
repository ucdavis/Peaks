import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPerson } from "../../Types";
import PeopleTable from "./PeopleTable";
import Denied from "../Shared/Denied";
import { PermissionsUtil } from "../../util/permissions"; 
import SearchTags from "../Tags/SearchTags";

interface IState {
  filters: string[];
  loading: boolean;
  people: IPerson[];
  tags: string[];
}
export default class PeopleContainer extends React.Component<{}, IState> {
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
      filters: [],
      loading: true,
      people: [],
      tags: []
    };
  }

  public async componentDidMount() {
    const people = await this.context.fetch(`/api/${this.context.team.name}/people/list/`);
    const tags = await this.context.fetch(`/api/${this.context.team.name}/tags/listTags`);

    this.setState({ loading: false, people, tags });
  }
  public render() {
    if (!PermissionsUtil.canViewPeople(this.context.permissions)) {
        return (
            <Denied viewName="People" />
        );
    }

    if(this.state.loading) {
      return <h2>Loading...</h2>;
  }

  let filteredPeople = this.state.people;
    if(this.state.filters.length > 0)
    {
      filteredPeople = filteredPeople.filter(x => this._checkTagFilters(x, this.state.filters));
    }
  return(
    <div className="card">
      <div className="card-body">
        <h4 className="card-title">People</h4>
        <SearchTags tags={this.state.tags} selected={this.state.filters} onSelect={this._filterTags} disabled={false}/>
        <PeopleTable
          people={filteredPeople}
          onRevoke={this._revokeEquipment}
          onAdd={this._openAssignModal}
          showDetails={this._openDetailsModal}
          onEdit={this._openEditModal}
          />
      </div>
    </div>
    );
  }

  private _createAndMaybeAssignEquipment = async (
    person: IPerson,
    equipment: IPerson,
    date: any
  ) => {
    // // call API to create a equipment, then assign it if there is a person to assign to
    // // if we are creating a new equipment
    // if (equipment.id === 0) {
    //   equipment.teamId = this.context.team.id;
    //   equipment = await this.context.fetch(`/api/${this.context.team.name}/equipment/create`, {
    //     body: JSON.stringify(equipment),
    //     method: "POST"
    //   });
    // }

    // // if we know who to assign it to, do it now
    // if (person) {
    //   const assignUrl = `/api/${this.context.team.name}/equipment/assign?equipmentId=${equipment.id}&personId=${
    //     person.id
    //   }&date=${date}`;

    //   equipment = await this.context.fetch(assignUrl, {
    //     method: "POST"
    //   });
    // }

    // const index = this.state.equipment.findIndex(x => x.id === equipment.id);
    // if (index !== -1) {
    //   // update already existing entry in equipment
    //   const updateEquipment = [...this.state.equipment];
    //   updateEquipment[index] = equipment;

    //   this.setState({
    //     ...this.state,
    //     equipment: updateEquipment
    //   });
    // } else {
    //   this.setState({
    //     equipment: [...this.state.equipment, equipment]
    //   });
    // }
  };

  private _revokeEquipment = async (equipment: IPerson) => {
    // // call API to actually revoke
    // const removed: IEquipment = await this.context.fetch(`/api/${this.context.team.name}/equipment/revoke`, {
    //   body: JSON.stringify(equipment),
    //   method: "POST"
    // });

    // // remove from state
    // const index = this.state.equipment.indexOf(equipment);
    // if (index > -1) {
    //   const shallowCopy = [...this.state.equipment];
    //   if (this.props.person == null) {
    //       // if we are looking at all equipment, just update assignment
    //    shallowCopy[index].assignment = null;
    //   } else {
    //     // if we are looking at a person, remove from our list of equipment
    //     shallowCopy.splice(index, 1);
    //   }
    //   this.setState({ equipment: shallowCopy });
    // }
  };

  private _editEquipment = async (equipment: IPerson) =>
  {
    // const index = this.state.equipment.findIndex(x => x.id === equipment.id);

    // if(index === -1 ) // should always already exist
    // {
    //   return;
    // }

    // const updated: IEquipment = await this.context.fetch(`/api/${this.context.team.name}/equipment/update`, {
    //   body: JSON.stringify(equipment),
    //   method: "POST"
    // });

    // updated.assignment = equipment.assignment;

    // // update already existing entry in key
    // const updateEquipment = [...this.state.equipment];
    // updateEquipment[index] = updated;

    // this.setState({
    //   ...this.state,
    //   equipment: updateEquipment
    // }); 
  }

  private _filterTags = (filters: string[]) => {
    this.setState({filters: filters});
}

  private _checkTagFilters = (equipment: IEquipment, filters: string[]) => {
    return filters.every(f => equipment.tags.includes(f));
  }

  private _openAssignModal = (equipment: Person) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/assign/${equipment.id}`
    );
  };

  private _openCreateModal = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/equipment/create`);
  };

  private _openDetailsModal = (equipment: IPerson) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/details/${equipment.id}`
    );
  };

  private _openEditModal = (equipment: IPerson) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/edit/${equipment.id}`
    );
  }
  private _closeModals = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/people`);
  };

  private _getBaseUrl = () => {
    return `/${this.context.team.name}`;
  };
}
