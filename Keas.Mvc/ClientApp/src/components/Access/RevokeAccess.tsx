import * as React from 'react';
import { useState } from 'react';
import { Alert, Button } from 'reactstrap';
import { IAccessAssignment } from '../../models/Access';
import { DateUtil } from '../../util/dates';
import AccessModal from './AccessModal';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';

interface IProps {
  assignment?: IAccessAssignment;
  revoke: (accessAssignment: IAccessAssignment) => Promise<void>;
  cancelRevoke: () => void;
}

const RevokeAccess = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const valid = !!props.assignment;
  const assignment = props.assignment;
  const { person } = assignment || { person: null };

  const callRevoke = () => {
    setSubmitting(true);
    try {
      props.revoke(props.assignment);
    } catch (e) {
      setError('Error -- ' + e.message + ' -- Please try again later');
      setSubmitting(false);
    }
  };

  return valid ? (
    <AccessModal
      isOpen={true}
      closeModal={props.cancelRevoke}
      header={
        <h1>
          Revoke Access for {person.firstName} {person.lastName}
        </h1>
      }
      footer={
        <Button color='primary' onClick={callRevoke} disabled={submitting}>
          Revoke {submitting && <i className='fas fa-circle-notch fa-spin' />}
        </Button>
      }
    >
      {error && <Alert color='danger'>{error}</Alert>}
      <h1>Access Name: {assignment.access.name}</h1>
      <h2>Notes: </h2>
      <p>{assignment.access.notes}</p>
      {assignment.access.tags.length > 0 && (
        <>
          <p>
            <b>Tags</b>
          </p>
          <SearchDefinedOptions
            definedOptions={[]}
            disabled={true}
            onSelect={() => {}}
            selected={assignment.access.tags.split(',')}
            placeHolder='Search for Tags'
            id='searchTagsRevokeAccess'
          />
        </>
      )}
      <p>Expires At {DateUtil.formatExpiration(assignment.expiresAt)}</p>
    </AccessModal>
  ) : (
    <AccessModal
      isOpen={true}
      closeModal={props.cancelRevoke}
      header={<h1>Assignment not found</h1>}
    />
  );
};

export default RevokeAccess;
