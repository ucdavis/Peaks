import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, ISpace } from "../../Types";

interface IProps {
    space: ISpace;
}

export default class SpacesDetailContainer extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        <div>
          <h2 className="card-title">{this.props.space.roomNumber} {this.props.space.bldgName}</h2>
          <div className="card-text">
            {this.props.space.roomName && <div>{this.props.space.roomName}</div>}
          </div>
        </div>
        <hr/>
        <br/>
      </div>

    );
  }
}
