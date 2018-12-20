import * as React from "react";

import { ISpace } from "../../Types";

interface IProps {
    space: ISpace;
    tags: string;
}

export default class SpacesDetailContainer extends React.Component<IProps, {}> {
  public render() {
    return (
      <div>
        <div>
          <h2 className="card-title">{this.props.space.roomNumber} {this.props.space.bldgName}</h2>
          <div className="card-text">
            {this.props.space.roomCategoryName && <div>{this.props.space.roomCategoryName}</div>}
            {this.props.space.roomName && <div>{this.props.space.roomName}</div>}
            {this.props.space.floorName && <div>{this.props.space.floorName}</div>}
            {this.props.space.sqFt && <div>{this.props.space.sqFt} Sq Feet</div>}
            <p className="card-text">
            <i className="fas fa-tags" aria-hidden="true" />{" "}
            {this.props.tags}
          </p>
          </div>
        </div>
        <br/>
      </div>

    );
  }
}
