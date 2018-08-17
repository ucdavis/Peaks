import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IPersonInfo, IPerson } from "../../Types";
import PeopleTable from "./PeopleTable";
import Denied from "../Shared/Denied";
import { PermissionsUtil } from "../../util/permissions"; 
import SearchTags from "../Tags/SearchTags";
import PersonDetails from "./PersonDetails";

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
          {!personAction && 
            this._renderTableView()
          }
          {personAction === "details" && !!detailPerson && !!detailPerson.person &&
            this._renderDetailsView(detailPerson.person)
          }
        </div>
      </div>
    );
  }

  private _renderTableView = () => {
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
        onEdit={this._openEditModal}
        filtered={this.state.tableFilters}
        updateFilters={this._updateTableFilters}
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
        totalUpdated={this._assetTotalUpdated}
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

private _assetTotalUpdated = (type: string, spaceId: number, personId: number, count: number) => {
  // TODO: this will be used when we have different key counts

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

  // controls for modal opening to manage people
  private _openAssignModal = (person: IPerson) => {
    this.context.router.history.push(
      `${this._getBaseUrl()}/people/assign/${person.id}`
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
  private _goBack = () => {
    this.context.router.history.push(`${this._getBaseUrl()}/people`);
  };

  private _getBaseUrl = () => {
    return `/${this.context.team.name}`;
  };
}
