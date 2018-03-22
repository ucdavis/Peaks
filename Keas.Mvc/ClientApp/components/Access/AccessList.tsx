import * as React from "react";

import AccessListItem from "./AccessListItem";

import { IAccess } from "../../Types";

interface IProps {
    access: IAccess[];
    onRevoke: (access: IAccess) => void;
    onAdd: (access: IAccess) => void;
    showDetails: (access: IAccess) => void;
}

export default class AccessList extends React.Component<IProps, {}> {
  public render() {
      const access = this.props.access.map(x => (
          <AccessListItem
              key={x.id.toString()}
              accessEntity={x}
              onRevoke={this.props.onRevoke}
              onAdd={this.props.onAdd}
              showDetails={this.props.showDetails}
          />
    ));
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Number</th>
            <th>Assigned?</th>
            <th>Expiration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{access}</tbody>
      </table>
    );
  }
}
