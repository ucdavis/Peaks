import * as React from 'react';
import { toast } from 'react-toastify';

import {
  IMatchParams,
  IAccessAssignment,
  IPerson,
  IAccess
} from 'ClientApp/Types';
import { RouteChildrenProps, withRouter } from 'react-router';
import AssignmentTable from './AssignmentTable';
import RevokeAccess from './RevokeAccess';
import { Context } from '../../Context';
import AccessList from './AccessList';

// List of assignments passed by props, since this container can be in multiple places
interface IProps extends RouteChildrenProps<IMatchParams> {
  onRevokeSuccess?(assignment: IAccessAssignment);
  disableEditing?: boolean;
  person?: IPerson;
  access?: IAccess;
}

interface IState {
  isRevokeModalShown: boolean;
  selectedAssignment?: IAccessAssignment;
  assignments: Array<IAccessAssignment>;
}

class AssignmentContainer extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props: IProps) {
    super(props);

    const assignments = (props.access && props.access.assignments) || [];

    this.state = {
      isRevokeModalShown: props.match.params.action === 'revoke',
      assignments: assignments,
      selectedAssignment: assignments.find(
        el => el.id === parseInt(props.match.params.id, 10)
      )
    };
  }

  async fetchAssignments(): Promise<IAccessAssignment[]> {
    const accessFetchUrl = `/api/${this.context.team.slug}/access/listAssigned?personId=${this.props.person.id}`;
    let accesses: IAccess[] = null;
    try {
      accesses = await this.context.fetch(accessFetchUrl);
    } catch (err) {
      toast.error('Error loading access list. Please refresh and try again.');
    }

    return accesses.map(access => ({
      ...access.assignments.find(
        assignment => assignment.accessId === access.id
      ),
      access
    }));
  }

  async componentDidMount() {
    if (this.state.assignments.length === 0) {
      let assignments = await this.fetchAssignments();
      console.log(assignments);
      this.setState({
        assignments: assignments
      });
    }
  }

  private showRevokeModal = assignment => {
    this.setState({
      isRevokeModalShown: true,
      selectedAssignment: assignment
    });
  };

  private hideRevokeModal = () => {
    this.setState({
      isRevokeModalShown: false,
      selectedAssignment: null
    });
  };
  private callRevoke = async assignment => {
    console.log(assignment);
    const assignments = this.state.assignments;
    try {
      this.setState({
        assignments: assignments.splice(assignments.indexOf(assignment), 1)
      });
      this.props.onRevokeSuccess(assignment);
      await this.hideRevokeModal();
    } catch (e) {
      console.error(e);
    }
  };

  public render() {
    return (
      <div>
        {this.state.isRevokeModalShown && (
          <RevokeAccess
            assignment={this.state.selectedAssignment}
            revoke={this.callRevoke}
            cancelRevoke={this.hideRevokeModal}
          />
        )}
        {this.props.person ? (
          <AccessList showDetails={this._openDetails} personView={true} access={this.state.assignments.map(assignment => assignment.access)}/>
        ) : (
          <AssignmentTable
            assignments={this.state.assignments}
            onRevoke={this.showRevokeModal}
            disableEditing={this.props.disableEditing}
          ></AssignmentTable>
        )}
      </div>
    );
  }

  private _openDetails = (access: IAccess) => {
    this.props.history.push(
      `${this._getBaseUrl()}/access/details/${access.id}`
    );
  };

  private _getBaseUrl = () => {
    return `/${this.context.team.slug}`;
  };
}

export default withRouter(AssignmentContainer);
