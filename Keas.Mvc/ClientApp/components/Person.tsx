import * as React from "react";

import { IPerson } from './PersonContainer';

interface IProps {
    person: IPerson
}

export default class Person extends React.Component<IProps, {}> {
  public render() {
    return <div>Welcome {this.props.person.user.name}</div>;
  }
}