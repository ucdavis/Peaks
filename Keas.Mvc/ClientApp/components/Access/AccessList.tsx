import * as React from "react";

import AccessListItem from "./AccessListItem";

import { IAccess } from "../../Types";

interface IProps {
    access: IAccess[];
    personView: boolean;
    onRevoke: (access: IAccess) => void;
    onAdd: (access: IAccess) => void;
    onEdit: (access: IAccess) => void;
    showDetails: (access: IAccess) => void;
}

export default class AccessList extends React.Component<IProps, {}> {
  public render() {
      const access = this.props.access.map(x => (
          <AccessListItem
              key={x.id.toString()}
              accessEntity={x}
              personView={this.props.personView}
              onRevoke={this.props.onRevoke}
              onAdd={this.props.onAdd}
              onEdit={this.props.onEdit}
              showDetails={this.props.showDetails}
          />
    ));
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Assigned?</th>
            <th>Number of Assignments</th>
            <th>Expiration</th>
            <th className="actions">Actions</th>
          </tr>
        </thead>
        <tbody>{access}</tbody>
      </table>
    );
  }
}
