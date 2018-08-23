import PropTypes from "prop-types";
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

          <h2>{this.props.person.user.name}</h2>
          <p>
            <i className="far fa-envelope" aria-hidden="true" />{" "}
            {this.props.person.user.email}
          </p>
          <p className="card-text">
            <i className="fas fa-tags" aria-hidden="true" />{" "}
            {this.props.person.tags}
          </p>
          <hr/>
        <br/>

      </div>
    );
  }
}
