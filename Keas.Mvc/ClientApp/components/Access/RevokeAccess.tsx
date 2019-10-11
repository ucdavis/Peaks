import * as React from 'react';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../Types';
import AccessEditValues from './AccessEditValues';
import AccessModal from './AccessModal';

interface IProps {
  assignment: IAccessAssignment;
  revoke: (accessAssignment: IAccessAssignment) => Promise<void>;
  cancelRevoke();
}

interface IState {
  submitting: boolean;
}

export default class RevokeAccess extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {submitting: false}
  }
  public render() {
    return (
      <AccessModal
        isOpen={true}
        closeModal={this.props.cancelRevoke}
        header={<h1>Revoke Access for {this.props.assignment.person.firstName}</h1>}
        footer={
          <Button
            color='primary'
            onClick={() => {
              this.setState({submitting: true})
              this.props.revoke(this.props.assignment).catch(e => console.error(e)).finally(() => this.setState({submitting: false}))
            }}
            disabled={this.state.submitting}
          >
            Revoke{' '}
            {this.state.submitting && (
              <i className='fas fa-circle-notch fa-spin' />
            )}
          </Button>
        }
      ></AccessModal>
    );
  }
}
