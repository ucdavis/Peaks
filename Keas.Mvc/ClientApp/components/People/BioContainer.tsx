import * as PropTypes from 'prop-types';
import * as React from "react";
import { AppContext, IPerson } from "../../Types";

interface IProps {
    person: IPerson;
}

export default class BioContainer extends React.Component<IProps, {}> {
  public static contextTypes = {
    fetch: PropTypes.func
  };
  public context: AppContext;
  public render() {
    return (
      <div>

          <h2>{this.props.person.name}</h2>
          <p>
            {this.props.person.title}
          </p>
          <p>            
            <i className="fas fa-user-tie" aria-hidden="true" />{" "}
            {this.props.person.supervisor ? this.props.person.supervisor.name : ""}
          </p>
          <p>
            <i className="far fa-envelope" aria-hidden="true" />{" "}
            {this.props.person.email}
          </p>
          <p className="card-text">
            <i className="fas fa-briefcase" aria-hidden="true" />{" "}
            {this.props.person.teamPhone}
          </p>
          <p className="card-text">
            <i className="fas fa-home" aria-hidden="true" />{" "}
            {this.props.person.homePhone}
          </p>
          <p className="card-text">
            <i className="fas fa-tags" aria-hidden="true" />{" "}
            {this.props.person.tags}
          </p>
        <br/>

      </div>
    );
  }
}
