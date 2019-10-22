import * as React from 'react';
import { Alert, Button } from 'reactstrap';
import { IAccessAssignment } from '../../Types';
import AccessModal from './AccessModal';

interface IProps {
  assignment?: IAccessAssignment;
  revoke: (accessAssignment: IAccessAssignment) => Promise<void>;
  cancelRevoke();
}

interface IState {
  submitting: boolean;
  error?: string;
}

export default class RevokeAccess extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { submitting: false };
  }

  public render() {
    const valid = !!this.props.assignment;
    const assignment = this.props.assignment;
    return valid ? (
      <AccessModal
        isOpen={true}
        closeModal={this.props.cancelRevoke}
        header={
          <h1>Revoke Access for {this.props.assignment.person.firstName}</h1>
        }
        footer={
          <Button
            color='primary'
            onClick={this._callRevoke}
            disabled={this.state.submitting}
          >
            Revoke{' '}
            {this.state.submitting && (
              <i className='fas fa-circle-notch fa-spin' />
            )}
          </Button>
        }
      >
        {this.state.error && <Alert color='danger'>{this.state.error}</Alert>}
        <h1>Name: </h1>
        <p>{assignment.access.name}</p>
        <h2>Notes: </h2>
        <p>{assignment.access.notes}</p>
        <p>Expires At {assignment.expiresAt}</p>
      </AccessModal>
    ) : (
      <AccessModal
        isOpen={true}
        closeModal={this.props.cancelRevoke}
        header={<h1>Assignment not found</h1>}
      />
    );
  }

  private _callRevoke = () => {
    this.setState({ submitting: true });
    try {
      this.props.revoke(this.props.assignment)
    } catch(e) {
      this.setState({
        error: 'Error -- ' + e.message + ' -- Please try again later',
        submitting: false
      });
    }
  };
}