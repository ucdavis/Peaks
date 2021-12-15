import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { IPerson } from '../../models/People';

interface IProps {
  person: IPerson;
  teamName: string;
}

const PeopleListItem = (props: IProps) => {
  const personUrl = `/${props.teamName}/person/details/${props.person.id}`;
  return (
    <div>
      <NavLink to={personUrl}>{props.person.name}</NavLink>
    </div>
  );
};

export default PeopleListItem;
