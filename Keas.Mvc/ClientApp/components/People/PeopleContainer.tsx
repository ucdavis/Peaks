import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPersonInfo, IPerson } from "../../Types";
import PeopleTable from "./PeopleTable";
import Denied from "../Shared/Denied";
import { PermissionsUtil } from "../../util/permissions"; 
import SearchTags from "../Tags/SearchTags";
import PersonDetails from "./PersonDetails";
import CreatePerson from "./CreatePerson";

interface IState {
  loading: boolean;
  people: IPersonInfo[];
  tableFilters: any[]; // object containing filters on table
  tagFilters: string[]; // string of tag filters 
  tags: string[]; // existing tags that are options for SearchTags
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
      loading: true,
      people: [],
      tableFilters: [],
      tagFilters: [],
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

    const { personAction, assetType, personId } = this.context.router.route.match.params;
    const selectedId = parseInt(personId, 10);
    const detailPerson = this.state.people.find(e => e.id === selectedId);
    
    return(
      <div className="card">
        <div className="card-body">
          <h4 className="card-title"><i className="fas fa-users fa-xs"/> People</h4>
          {(!personAction || personAction === "create") && 
            this._renderTableView(personAction === "create")
          }
          {personAction === "details" && !!detailPerson && !!detailPerson.person &&
            this._renderDetailsView(detailPerson.person)
          }
        </div>
      </div>
    );
  }

  private _renderTableView = (createModal: boolean) => {
    let filteredPeople = this.state.people;
    if(this.state.tagFilters.length > 0)
    {
      filteredPeople = filteredPeople.filter(x => this._checkTagFilters(x.person, this.state.tagFilters));
    }
    return (
      <div>
      <SearchTags tags={this.state.tags} selected={this.state.tagFilters} onSelect={this._filterTags} disabled={false}/>
      <PeopleTable
        people={filteredPeople}
        showDetails={this._openDetailsModal}
        filtered={this.state.tableFilters}
        updateFilters={this._updateTableFilters}
      />
      <CreatePerson  
        onCreate={this._createPerson}
        modal={createModal}
        onAddNew={this._openCreateModal}
        closeModal={this._goBack}
        tags={this.state.tags}
        users={this.state.people.map(x => x.person.user)}
        />
      </div>
    ); 
  }

  private _renderDetailsView = (detailPerson: IPerson) => {
    return(
      <PersonDetails
        selectedPerson={detailPerson}
        tags={this.state.tags}
        goBack={this._goBack}
        inUseUpdated={this._assetInUseUpdated}
        onEdit={this._editPerson}
      />
    );
  }

  private _updateTableFilters = (filters: any[]) => {
    this.setState({tableFilters: filters});
  }

  // managing counts for assigned or revoked
  private _assetInUseUpdated = (type: string, spaceId: number, personId: number, count: number) => {
    const index = this.state.people.findIndex(x => x.id === personId);
    if(index > -1)
    {
        const people = [...this.state.people];
        switch(type) {
          case "equipment": 
            people[index].equipmentCount += count;
            break;
          case "key":
            people[index].keyCount += count;
            break;
          case "access":
            people[index].accessCount += count;
            break;
          case "workstation":
            people[index].workstationCount += count;
        }
        this.setState({people});
    } 
}

  // tags 
  private _filterTags = (filters: string[]) => {
    this.setState({tagFilters: filters});
}

  private _checkTagFilters = (person: IPerson, filters: string[]) => {
    return filters.every(f => person.tags.includes(f));
  }

  private _createPerson = async (
    person: IPerson,
  ) => {
    let created = false;
    let assigned = false;
    
    // call API to create a workstation, then assign it if there is a person to assign to
    // if we are creating a new workstation
    // if (person.id === 0) {
    //   workstation.teamId = this.context.team.id;
    //   workstation = await this.context.fetch(`/api/${this.context.team.name}/workstations/create`, {
    //     body: JSON.stringify(workstation),
    //     method: "POST"
    //   });
    //   created = true;
    // }

    // // if we know who to assign it to, do it now
    // if (person) {
    //   const assignUrl = `/api/${this.context.team.name}/workstations/assign?workstationId=${workstation.id}&personId=${
    //     person.id
    //   }&date=${date}`;

    //   workstation = await this.context.fetch(assignUrl, {
    //     method: "POST"
    //   });
    //   workstation.assignment.person = person;
    //   assigned = true;
    // }

    // const index = this.state.workstations.findIndex(x => x.id === workstation.id);
    // if (index !== -1) {
    //   // update already existing entry in workstation
    //   const updateWorkstation = [...this.state.workstations];
    //   updateWorkstation[index] = workstation;

    //   this.setState({
    //     ...this.state,
    //     workstations: updateWorkstation
    //   });
    // } else if (!!this.props.space && this.props.space.id !== workstation.space.id) {
    //     // if we are on the space tab and we have created a workstation that is not in this space, do nothing to our state here
    // } else {
    //   this.setState({
    //     workstations: [...this.state.workstations, workstation]
    //   });
    // }
    // if(created && this.props.assetTotalUpdated)
    // {
    //     this.props.assetTotalUpdated("workstation", workstation.space ? workstation.space.id : null, 
    //         this.props.person? this.props.person.id : null, 1);
    // }
    // if(assigned && this.props.assetInUseUpdated)
    // {
    //     this.props.assetInUseUpdated("workstation", workstation.space? workstation.space.id : null, 
    //     this.props.person? this.props.person.id : null, 1);
    // }

  };

  private _editPerson = async (person: IPerson) =>
  {
    const index = this.state.people.findIndex(x => x.id === person.id);

    if(index === -1 ) // should always already exist
    {
      return;
    }

    const updated: IPerson = await this.context.fetch(`/api/${this.context.team.name}/people/update`, {
      body: JSON.stringify(person),
      method: "POST"
    });

    // update already existing entry in key
    const updatePeople = [...this.state.people];
    updatePeople[index].person = updated;

    this.setState({
      ...this.state,
      people: updatePeople
    }); 
}

  // controls for modal opening to manage people
  private _openAssignModal = (person: IPerson) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/assign/${person.id}`
    );
  };

  private _openCreateModal = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/people/create`);
  };

  private _openDetailsModal = (person: IPerson) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/details/${person.id}`
    );
  };

  private _openEditModal = (person: IPerson) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/edit/${person.id}`
    );
  }
  private _goBack = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/people`);
  };

  private _getBaseUrl = () => {
    return `/${this.context.team.name}`;
  };
}
