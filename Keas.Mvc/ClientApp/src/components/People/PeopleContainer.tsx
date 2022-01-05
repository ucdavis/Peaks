import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Context } from '../../Context';
import { IKey } from '../../models/Keys';
import { IPerson, IPersonInfo } from '../../models/People';
import { IMatchParams } from '../../models/Shared';
import { PermissionsUtil } from '../../util/permissions';
import Denied from '../Shared/Denied';
import SearchTags from '../Tags/SearchTags';
import CreatePerson from './CreatePerson';
import PeopleTable from './PeopleTable';
import PersonDetails from './PersonDetails';

const PeopleContainer = props => {
  const [loading, setLoading] = useState<boolean>(true);
  const [people, setPeople] = useState<IPersonInfo[]>([]);
  const [tableFilters, setTableFilters] = useState<any[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const context = useContext(Context);
  const history = useHistory();
  const params: IMatchParams = useParams();

  useEffect(() => {
    if (!PermissionsUtil.canViewPeople(context.permissions)) {
      return;
    }

    const fetchPeople = async () => {
      let newPeople: IPersonInfo[] = null;
      try {
        newPeople = await context.fetch(
          `/api/${context.team.slug}/people/list/`
        );
      } catch (err) {
        toast.error('Error fetching people. Please refresh to try again.');
        return;
      }

      setPeople(newPeople);
      setLoading(false);
    };

    fetchPeople();
  }, [context]);

  const renderTableView = (createModal: boolean) => {
    let filteredPeople = people;
    if (tagFilters.length > 0) {
      filteredPeople = filteredPeople.filter(x =>
        checkTagFilters(x.person, tagFilters)
      );
    }
    return (
      <div>
        <SearchTags
          tags={context.tags}
          selected={tagFilters}
          onSelect={filterTags}
          disabled={false}
        />
        <PeopleTable
          people={filteredPeople}
          showDetails={openDetailsModal}
          filtered={tableFilters}
          updateFilters={updateTableFilters}
        />
      </div>
    );
  };

  const renderDetailsView = (detailPerson: IPersonInfo) => {
    return (
      <PersonDetails
        key={`person-details-${detailPerson.id}`}
        router={props}
        selectedPersonInfo={detailPerson}
        tags={context.tags}
        goBack={goBack}
        inUseUpdated={assetInUseUpdated}
        onEdit={editPerson}
        onDelete={deletePerson}
        goToKeyDetails={goToKeyDetails}
      />
    );
  };

  const updateTableFilters = (filters: any[]) => {
    setTableFilters(filters);
  };

  // managing counts for assigned or revoked
  const assetInUseUpdated = (
    type: string,
    spaceId: number,
    personId: number,
    count: number
  ) => {
    const index = people.findIndex(x => x.id === personId);
    if (index > -1) {
      const peopleData = [...people];
      switch (type) {
        case 'equipment':
          peopleData[index].equipmentCount += count;
          break;
        case 'serial':
          peopleData[index].keyCount += count;
          break;
        case 'access':
          peopleData[index].accessCount += count;
          break;
        case 'workstation':
          peopleData[index].workstationCount += count;
      }
      setPeople(peopleData);
    }
  };

  // tags
  const filterTags = (filters: string[]) => {
    setTagFilters(filters);
  };

  const checkTagFilters = (person: IPerson, filters: string[]) => {
    return filters.every(
      f => !!person && !!person.tags && person.tags.includes(f)
    );
  };

  const createPerson = async (person: IPerson) => {
    const index = people.findIndex(x => x.person.userId === person.userId);
    if (index !== -1) {
      // if we somehow already have this person, return
      return;
    }
    person.teamId = context.team.id;
    try {
      person = await context.fetch(`/api/${context.team.slug}/people/create`, {
        body: JSON.stringify(person),
        method: 'POST'
      });
      toast.success('Successfully created person!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error creating person'
          : `Error creating person, ${err.message}`;
      toast.error(errorMessage);
      throw new Error();
    }
    // since this is a new person, they will not have anything assigned
    const personInfo: IPersonInfo = {
      accessCount: 0,
      equipmentCount: 0,
      id: person.id,
      keyCount: 0,
      person,
      workstationCount: 0
    };
    setPeople(prevPeople => [...prevPeople, personInfo]);
  };

  const editPerson = async (person: IPerson) => {
    const index = people.findIndex(x => x.id === person.id);

    if (index === -1) {
      // should always already exist
      return;
    }

    let updated: IPerson = null;
    try {
      updated = await context.fetch(
        `/api/${context.team.slug}/peopleAdmin/update`,
        {
          body: JSON.stringify(person),
          method: 'POST'
        }
      );
      toast.success('Sucessfully updated person!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error editing person'
          : `Error editing person, ${err.message}`;
      toast.error(errorMessage);
      throw new Error();
    }

    // update already existing entry in key
    const updatePeople = [...people];
    updatePeople[index].person = updated;
    setPeople(updatePeople);
  };

  const deletePerson = async (person: IPerson) => {
    const index = people.findIndex(x => x.id === person.id);

    if (index === -1) {
      // should always already exist
      return;
    }

    if (!confirm('Are you sure you want to delete person?')) {
      return false;
    }

    try {
      await context.fetch(
        `/api/${context.team.slug}/peopleAdmin/delete/${person.id}`,
        {
          method: 'POST'
        }
      );
      toast.success('Successfully deleted person!');
    } catch (err) {
      const errorMessage =
        err.message === ''
          ? 'Error deleting person'
          : `Error deleting person, ${err.message}`;
      toast.error(errorMessage);
      throw new Error();
    }

    goBack();

    // update already existing entry in key
    const updatePeople = [...people];
    updatePeople.splice(index, 1);
    setPeople(updatePeople);
  };

  const goToKeyDetails = (key: IKey) => {
    history.push(`/${context.team.slug}/keys/details/${key.id}`);
  };

  const openCreateModal = () => {
    history.push(`${getBaseUrl()}/people/create`);
  };

  const openDetailsModal = (person: IPerson) => {
    history.push(`${getBaseUrl()}/people/details/${person.id}`);
  };

  const goBack = () => {
    history.push(`${getBaseUrl()}/people`);
  };

  const getBaseUrl = () => {
    return `/${context.team.slug}`;
  };

  if (!PermissionsUtil.canViewPeople(context.permissions)) {
    return <Denied viewName='People' />;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  const { containerAction: personAction, containerId: personId } = params;
  const selectedId = parseInt(personId, 10);
  const detailPerson = people.find(e => e.id === selectedId);
  return (
    <div className='card people-color'>
      <div className='card-header-people'>
        <div className='card-head row justify-content-between'>
          <h2>
            <i className='fas fa-users fa-xs' /> People
          </h2>
          <CreatePerson
            onCreate={createPerson}
            modal={personAction === 'create'}
            onAddNew={openCreateModal}
            closeModal={goBack}
            tags={context.tags}
            userIds={people.map(x => x.person.userId)}
          />
        </div>
      </div>
      <div className='card-content'>
        {(!personAction || personAction === 'create') &&
          renderTableView(personAction === 'create')}
        {personAction === 'details' &&
          !!detailPerson &&
          !!detailPerson.person &&
          renderDetailsView(detailPerson)}
      </div>
    </div>
  );
};

export default PeopleContainer;
