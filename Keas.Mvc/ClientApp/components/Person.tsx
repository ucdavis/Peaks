import * as React from "react";

import { IPerson } from "./PersonContainer";

interface IProps {
  person: IPerson;
}

export default class Person extends React.Component<IProps, {}> {
  public render() {
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">{this.props.person.user.name}</h4>
          <p className="card-text">
            <i className="fa fa-envelope-o" aria-hidden="true" />{" "}
            {this.props.person.user.email}
          </p>
        </div>
      </div>
    );
  }
}
