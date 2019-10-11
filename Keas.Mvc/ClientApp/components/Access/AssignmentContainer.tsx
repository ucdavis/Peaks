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
import { access } from 'fs';

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
    const {action} = props.match.params

    this.state = {
      isRevokeModalShown: action === 'revoke',
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
      this.setState({
        assignments: assignments,
        selectedAssignment: assignments.find(
          el => el.id === parseInt(this.props.match.params.id, 10)
        )
      });
    }
  }

  private showRevokeModal = (assignment:IAccessAssignment) => {
    this.setState({
      isRevokeModalShown: true,
      selectedAssignment: assignment
    });
    this.props.history.push(`${this._getBaseUrl()}/accessAssignment/revoke/${assignment.id}`)
  };

  private hideRevokeModal = () => {
    this.setState({
      isRevokeModalShown: false,
      selectedAssignment: null
    });
    this.props.history.replace(this._getBaseUrl())
  };
  private callRevoke = async assignment => {
    await this.context.fetch(
      `/api/${this.context.team.slug}/access/revoke/${assignment.id}`,
      {
        method: 'POST'
      }
    );

    toast.success('Access revoked sucessfully!');

    let assignments = this.state.assignments;
    assignments.splice(assignments.indexOf(assignment), 1)
    this.setState({
      assignments: assignments
    });
    this.hideRevokeModal();
    this.props.onRevokeSuccess(assignment);
  };

  public render() {
    return (
      <div className='card access-color'>
        <div className='card-header-access'>
          <div className='card-head row justify-content-between'>
            <h2>
              <i className='fas fa-address-card fa-xs' /> Access
            </h2>
          </div>
        </div>
        <div className='card-content'>
          {this.state.isRevokeModalShown && (
            <RevokeAccess
              assignment={this.state.selectedAssignment}
              revoke={this.callRevoke}
              cancelRevoke={this.hideRevokeModal}
            />
          )}
          {this.props.person ? (
            <AccessList
              showDetails={this._openDetails}
              personView={true}
              access={this.state.assignments.map(
                assignment => assignment.access
              )}
              onRevoke={access => this.showRevokeModal(access.assignments.find(assignment => assignment.accessId === access.id)) }
            />
          ) : (
            <AssignmentTable
              assignments={this.state.assignments}
              onRevoke={this.showRevokeModal}
              disableEditing={this.props.disableEditing}
            ></AssignmentTable>
          )}
        </div>
      </div>
    );
  }

  private _openDetails = (access: IAccess) => {
    this.props.history.push(
      `${this.context.team.slug}/access/details/${access.id}`
    );
  };

  private _getBaseUrl = () => {
    return this.props.person ? `/${this.context.team.slug}/people/details/${this.props.person.id}` : `/${this.context.team.slug}/access/details/${this.props.access.id}`;
  };
}

export default withRouter(AssignmentContainer);
