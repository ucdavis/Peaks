import * as React from 'react';
import { RouteChildrenProps, withRouter } from 'react-router';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';
import { IAccess, IAccessAssignment, IMatchParams } from '../../Types';
import AssignmentTable from './AccessAssignmentTable';
import AccessList from './AccessList';
import AssignAccess from './AssignAccess';
import RevokeAccess from './RevokeAccess';

// List of assignments passed by props, since this container can be in multiple places
interface IProps extends RouteChildrenProps<IMatchParams> {
  disableEditing?: boolean;
  person?: IPerson;
  access?: IAccess;
  onRevokeSuccess?(assignment: IAccessAssignment);
  onAssignSuccess?(access: IAccessAssignment);
}

interface IState {
  selectedAssignment?: IAccessAssignment;
  assignments: IAccessAssignment[];
  tags: string[];
}

class AssignmentContainer extends React.Component<IProps, IState> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  constructor(props: IProps) {
    super(props);

    const assignments =
      (props.access &&
        props.access.assignments.map(assignment => ({
          ...assignment,
          access: props.access
        }))) ||
      [];
    const { action } = props.match.params;

    this.state = {
      assignments,
      selectedAssignment: assignments.find(
        el => el.id === parseInt(props.match.params.id, 10)
      ),
      tags: []
    };
  }

  // assume that props.person is valid
  public async fetchAssignments(): Promise<IAccessAssignment[]> {
    const accessFetchUrl = `/api/${this.context.team.slug}/access/listAssigned?personId=${this.props.person.id}`;
    let accesses: IAccess[] = null;
    try {
      accesses = await this.context.fetch(accessFetchUrl);
    } catch (err) {
      toast.error('Error loading access list. Please refresh and try again.');
    }

    return accesses.map(access => ({
      ...access.assignments.find(
        assignment =>
          assignment.accessId === access.id &&
          assignment.personId === this.props.person.id
      ),
      access
    }));
  }

  public async componentDidMount() {
    if (this.state.assignments.length === 0 && this.props.person) {
      const assignments = await this.fetchAssignments();
      this.setState({
        assignments,
        selectedAssignment: assignments.find(
          el => el.id === parseInt(this.props.match.params.id, 10)
        )
      });
    }

    const tags = await this.context.fetch(
      `/api/${this.context.team.slug}/tags/listTags`
    );
    this.setState({ tags });
  }

  public render() {
    const { action, containerAction, assetType } = this.props.match.params;
    const isRevokeModalShown =
      assetType === 'accessAssignment' && action === 'revoke';
    const isAssignModalShown =
      !this.props.disableEditing &&
      assetType === 'access' &&
      action === 'assign';
    return (
      <div className='card access-color'>
        <div className='card-header-access'>
          <div className='card-head row justify-content-between'>
            <h2>
              <i className='fas fa-address-card fa-xs' /> Assignments
            </h2>
            {containerAction === 'details' && (
              <Button color='link' onClick={this._openAssignModal}>
                <i className='fas fa-plus fa-sm' aria-hidden='true' /> Assign
                Access
              </Button>
            )}
          </div>
        </div>
        <div className='card-content'>
          {isRevokeModalShown && (
            <RevokeAccess
              assignment={this.state.selectedAssignment}
              revoke={this.callRevoke}
              cancelRevoke={this.hideModals}
            />
          )}
          {isAssignModalShown && (
            <AssignAccess
              closeModal={this.hideModals}
              modal={isAssignModalShown}
              person={this.props.person}
              tags={this.state.tags}
              onCreate={this.callAssign}
            />
          )}
          {this.props.person ? (
            <AccessList
              showDetails={this._openDetails}
              personView={true}
              access={this.state.assignments.map(
                assignment => assignment.access
              )}
              onAdd={this._openAssignModal}
              onRevoke={access =>
                this.showRevokeModal(
                  this.state.assignments.find(
                    assignment => assignment.accessId === access.id
                  )
                )
              }
            />
          ) : (
            <AssignmentTable
              assignments={this.state.assignments}
              onRevoke={this.showRevokeModal}
              disableEditing={this.props.disableEditing}
            />
          )}
        </div>
      </div>
    );
  }

  private showRevokeModal = (assignment: IAccessAssignment) => {
    this.setState({
      selectedAssignment: assignment
    });
    this.props.history.push(
      `${this._getBaseUrl()}/accessAssignment/revoke/${assignment.id}`
    );
  };

  private hideModals = () => {
    this.setState({
      selectedAssignment: null
    });
    this.props.history.replace(this._getBaseUrl());
  };

  private callRevoke = async assignment => {
    await this.context.fetch(
      `/api/${this.context.team.slug}/access/revoke/${assignment.id}`,
      {
        method: 'POST'
      }
    );

    toast.success('Access revoked sucessfully!');

    const assignments = this.state.assignments;
    assignments.splice(assignments.indexOf(assignment), 1);

    this.setState({
      assignments
    });

    this.hideModals();

    if (this.props.onRevokeSuccess) {
      this.props.onRevokeSuccess(assignment);
    }
  };

  private _openAssignModal = () => {
    if (this.props.access) {
      this.props.history.push(
        `/${this.context.team.slug}/access/assign/${this.props.access.id}`
      );
    } else if (this.props.person) {
      this.props.history.push(`${this._getBaseUrl()}/access/assign`);
    }
  };

  private callAssign = async (access: IAccess, date: any, person: IPerson) => {
    if (access.id === 0) {
      access.teamId = this.context.team.id;
      try {
        access = await this.context.fetch(
          `/api/${this.context.team.slug}/access/create`,
          {
            body: JSON.stringify(access),
            method: 'POST'
          }
        );
        toast.success('Access created successfully!');
      } catch (err) {
        toast.error('Error creating access.');
        throw new Error(); // throw error so modal doesn't close
      }
    }

    const assignUrl = `/api/${this.context.team.slug}/access/assign?accessId=${access.id}&personId=${person.id}&date=${date}`;
    let accessAssignment: IAccessAssignment = null;
    try {
      accessAssignment = await this.context.fetch(assignUrl, {
        method: 'POST'
      });

      access.assignments.push(accessAssignment);

      accessAssignment.access = access;
      toast.success('Access assigned successfully!');
    } catch (err) {
      toast.error('Error assigning access.');
      throw new Error(); // throw error so modal doesn't close
    }

    const assignments = this.state.assignments;
    assignments.push(accessAssignment);

    this.setState({
      assignments
    });

    this.props.onAssignSuccess(accessAssignment);
  };

  private _openDetails = (access: IAccess) => {
    this.props.history.push(
      `/${this.context.team.slug}/access/details/${access.id}`
    );
  };

  private _getBaseUrl = () => {
    return this.props.person
      ? `/${this.context.team.slug}/people/details/${this.props.person.id}`
      : `/${this.context.team.slug}/access/details/${this.props.access.id}`;
  };
}

export default withRouter(AssignmentContainer);
