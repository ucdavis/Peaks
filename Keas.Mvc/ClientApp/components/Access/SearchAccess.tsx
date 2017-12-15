import PropTypes from "prop-types";
import * as React from "react";

import { AppContext, IAccess } from "../../Types";
import AssignAccessList from "./AssignAccessList";

interface IProps {
  onSelect: (access: IAccess) => void;
}

interface IState {
  accessList: IAccess[];
  selectedAccess: IAccess;
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
      selectedAccess: null,
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

    // TODO: pull from typeahead
    const access = this.state.accessList.map(x => (
      <AssignAccessList
        key={x.id.toString()}
        onAssign={this._onSelected}
        access={x}
      />
    ));
    return (
      <div>
        <ul className="list-group">{access}</ul>
      </div>
    );
  }
}
