import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace } from "../../Types";

interface IProps {
    space: ISpace;
}

export default class SpacesDetailContainer extends React.Component<IProps, {}> {
  public render() {
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">{this.props.space.bldgName} {this.props.space.roomNumber}</h4>
          <div className="card-text">
            {this.props.space.roomName && <div>{this.props.space.roomName}</div>}
          </div>
        </div>
      </div>
    );
  }
}
