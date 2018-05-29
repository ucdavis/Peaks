import * as React from "react";

import WorkstationListItem from "./WorkstationListItem";

import { IWorkstation } from "../../Types";

interface IProps {
    workstations: IWorkstation[];
    onRevoke?: (workstation: IWorkstation) => void;
    onAdd?: (workstation: IWorkstation) => void;
    showDetails?: (workstation: IWorkstation) => void;
    onEdit?: (workstation: IWorkstation) => void;
}

export default class WorkstationList extends React.Component<IProps, {}> {
  public render() {
      const workstations = this.props.workstations.map(x => (
          <WorkstationListItem
              key={x.id.toString()}
              workstationEntity={x}
              onRevoke={this.props.onRevoke}
              onAdd={this.props.onAdd}
              showDetails={this.props.showDetails}
              onEdit={this.props.onEdit}
          />
    ));
      return (
      <div className="table">
        <table className="table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Assigned To</th>
              <th>Expiration</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>{workstations}</tbody>
        </table>
      </div>
    );
  }
}
