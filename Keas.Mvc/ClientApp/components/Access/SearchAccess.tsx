import PropTypes from "prop-types";
import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";

import { IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";

interface IProps {
    accessList: IAccess[];
    loading: boolean;
    onSelect: (access: IAccess) => void;
    onDeselect: () => void;
}

// Search for existing access then send selection back to parent
export default class SearchAccess extends React.Component<IProps, {}> {

  private _onSelected = (access: IAccess) => {
      //onChange is called when deselected
      if (access == null || access.name == null)
      {
          this.props.onDeselect();
      }
      else {
          //if teamId is not set, this is a new access
          this.props.onSelect({
              name: access.name,
              id: access.teamId ? access.id : 0,
              teamId: access.teamId ? access.teamId : 0
          });
      }
  };

  public render() {
    if (this.props.loading) return <div>Loading ... </div>;

    return (
        <div>
            <Typeahead
                labelKey="name"
                multiple={false}
                allowNew={true}
                options={this.props.accessList}
                placeholder="Assign a new access"
                newSelectionPrefix="Create a new access"
                onChange={(selected) => {
                    this._onSelected(selected[0]);
                }}
            />
        </div>
        
        );
  }
}
