import * as React from 'react';
import { useState } from 'react';
import { Alert, Button } from 'reactstrap';
import { IAccess, IAccessAssignment } from '../../models/Access';
import { IPerson } from '../../models/People';
import { DateUtil } from '../../util/dates';
import { format, startOfDay } from 'date-fns';
import AccessModal from './AccessModal';
import SearchDefinedOptions from '../Shared/SearchDefinedOptions';
import AssignDate from '../Shared/AssignDate';

interface IProps {
  assignment?: IAccessAssignment;
  update: (access: IAccess, date: any, person: IPerson) => Promise<void>;
  cancelUpdate: () => void;
}

const UpdateAccess = (props: IProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [dateError, setDateError] = useState<string>(null);
  const [error, setError] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date(props.assignment?.expiresAt));

  const valid = !!props.assignment;
  const assignment = props.assignment;
  const { person } = assignment || { person: null };

  const _callUpdate = () => {
    setSubmitting(true);
    try {
      props.update(
        props.assignment.access,
        format(date, 'MM/dd/yyyy'),
        props.assignment.person
      );
    } catch (e) {
      setError('Error -- ' + e.message + ' -- Please try again later');
      setSubmitting(false);
    }
  };

  const _changeDate = (newDate: Date) => {
    const now = new Date();

    if (newDate > now) {
      setDateError(null);
      setDate(startOfDay(new Date(newDate)));
      props.assignment.expiresAt = newDate;
    } else {
      setDateError('You must choose a date after today');
    }
  };

  if (!valid) {
    return (
      <AccessModal
        isOpen={true}
        closeModal={props.cancelUpdate}
        header={<h1>Assignment not found</h1>}
      />
    );
  }

  return (
    <AccessModal
      isOpen={true}
      closeModal={props.cancelUpdate}
      header={
        <h1>
          Edit Access for {person.firstName} {person.lastName}
        </h1>
      }
      footer={
        <Button
          color='primary'
          onClick={_callUpdate}
          disabled={submitting || dateError !== null}
        >
          Update {submitting && <i className='fas fa-circle-notch fa-spin' />}
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
            placeholder='Search for Tags'
            id='searchTagsUpdateAccess'
          />
        </>
      )}
      <AssignDate
        isRequired={true}
        date={new Date(props.assignment.expiresAt)}
        onChangeDate={_changeDate}
      />
      <p>Expires At {DateUtil.formatExpiration(assignment.expiresAt)}</p>
      {dateError && <div className='invalid-feedback d-block'>{dateError}</div>}
    </AccessModal>
  );
};

export default UpdateAccess;
