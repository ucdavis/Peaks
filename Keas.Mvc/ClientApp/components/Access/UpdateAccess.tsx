import * as React from 'react';
import DatePicker from 'react-date-picker';
import { Alert, Button } from 'reactstrap';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import SearchTags from '../Tags/SearchTags';
import AccessModal from './AccessModal';

interface IProps {
  assignment?: IAccessAssignment;
  update: (accessAssignment: IAccessAssignment) => Promise<void>;
  cancelUpdate: () => void;
}

interface IState {
  submitting: boolean;
  date?: Date;
  error?: string;
}

export default class UpdateAccess extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { submitting: false, date: this.props.assignment.expiresAt };
  }

  public render() {
    const valid = !!this.props.assignment;
    const assignment = this.props.assignment;
    const { person } = assignment || { person: null };
    return valid ? (
      <AccessModal
        isOpen={true}
        closeModal={this.props.cancelUpdate}
        header={
          <h1>
            Edit Access for {person.firstName} {person.lastName}
          </h1>
        }
        footer={
          <Button
            color='primary'
            onClick={this._callUpdate}
            disabled={this.state.submitting}
          >
            Update{' '}
            {this.state.submitting && (
              <i className='fas fa-circle-notch fa-spin' />
            )}
          </Button>
        }
      >
        {this.state.error && <Alert color='danger'>{this.state.error}</Alert>}
        <h1>Access Name: {assignment.access.name}</h1>
        <h2>Notes: </h2>
        <p>{assignment.access.notes}</p>
        {assignment.access.tags.length > 0 && (
          <>
            <p>
              <b>Tags</b>
            </p>
            <SearchTags
              tags={[]}
              disabled={true}
              onSelect={() => {}}
              selected={assignment.access.tags.split(',')}
            />
          </>
        )}
        <DatePicker
          format='MM/dd/yyyy'
          required={true}
          clearIcon={null}
          value={new Date(this.props.assignment.expiresAt)}
          onChange={this._changeDate}
        />
        <p>Expires At {DateUtil.formatExpiration(assignment.expiresAt)}</p>
      </AccessModal>
    ) : (
      <AccessModal
        isOpen={true}
        closeModal={this.props.cancelUpdate}
        header={<h1>Assignment not found</h1>}
      />
    );
  }

  private _callUpdate = () => {
    this.setState({ submitting: true });
    try {
      this.props.update(this.props.assignment);
    } catch (e) {
      this.setState({
        error: 'Error -- ' + e.message + ' -- Please try again later',
        submitting: false
      });
    }
  };

  private _changeDate = (date: Date) => {
    this.setState({ date: date });
    this.props.assignment.expiresAt = date;
  };
}
