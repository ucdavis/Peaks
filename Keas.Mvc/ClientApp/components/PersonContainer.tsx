import * as React from "react";

import Person from './Person';

interface IUser {
  name: string;
  email: string;
}

export interface IPerson {
  id: number;
  userid: number;
  user: IUser;
}

interface IProps {
  person: IPerson
}

export default class PersonContainer extends React.Component<IProps, {}> {
  public render() {
      return <Person person={this.props.person} />;
  }
}
