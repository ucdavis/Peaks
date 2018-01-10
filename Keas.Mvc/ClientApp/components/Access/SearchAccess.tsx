import PropTypes from "prop-types";
import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";

import { AppContext, IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";

interface IProps {
  onSelect: (access: IAccess) => void;
}

interface IState {
  accessList: IAccess[];
  loading: boolean;
}

// Search for existing access then send selection back to parent
export default class SearchAccess extends React.Component<IProps, IState> {
  public static contextTypes = {
    fetch: PropTypes.func,
    person: PropTypes.object
  };
  public context: AppContext;
  constructor(props) {
    super(props);

    this.state = {
      accessList: [],
      loading: true
    };
  }

  async componentDidMount() {
    const accessList: IAccess[] = await this.context.fetch(
      `/access/listteamaccess?teamId=${this.context.person.teamId}`
    );
    this.setState({ accessList, loading: false });
  }

  private _onSelected = (access: IAccess) => {
      this.props.onSelect(access);
  };

  public render() {
    if (this.state.loading) return <div>Loading ... </div>;

    return (
        <div>
            <Typeahead
                labelKey="name"
                multiple={false}
                allowNew={false}
                options={this.state.accessList}
                placeholder="Assign a new access"
                onChange={(selected) => {
                    this._onSelected(selected[0]);
                }}
            />
        </div>
        
        );
  }
}
