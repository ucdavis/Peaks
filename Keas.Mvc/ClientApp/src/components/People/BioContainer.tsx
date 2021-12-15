import * as React from 'react';
import { useContext } from 'react';
import { Button } from 'reactstrap';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';
import { DateUtil } from '../../util/dates';

interface IProps {
  person: IPerson;
}

const BioContainer = (props: IProps) => {
  const context = useContext(Context);

  return (
    <div className='card-content person-card'>
      <div className='row justify-content-between'>
        {(props.person.title ||
          props.person.category ||
          props.person.startDate ||
          props.person.endDate ||
          props.person.supervisor) && (
          <div className='person-col'>
            <h4>Employment Details</h4>
            <div className='row justify-content-between'>
              <div className='person-label-list'>
                {props.person.title && <p className='person-label'>Title</p>}
                {props.person.category && <p>Category</p>}
                {props.person.startDate && (
                  <p className='person-label'>Start Date</p>
                )}
                {props.person.endDate && (
                  <p className='person-label'>End Date</p>
                )}
              </div>
              <div>
                {props.person.title && <p>{props.person.title}</p>}
                {props.person.category && <p>{props.person.category}</p>}
                {props.person.startDate && (
                  <p>{DateUtil.formatExpiration(props.person.startDate)}</p>
                )}

                {props.person.endDate && (
                  <p>{DateUtil.formatExpiration(props.person.endDate)}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {(props.person.email ||
          props.person.homePhone ||
          props.person.teamPhone) && (
          <div className='person-col'>
            <h4>Contact Details</h4>
            <div className='row justify-content-between'>
              <div className='person-label-list'>
                {props.person.email && <p className='person-label'>Email</p>}
                {props.person.userId && <p className='person-label'>User Id</p>}
                {props.person.homePhone && <p className='person-label'>Home</p>}
                {props.person.teamPhone && <p className='person-label'>Team</p>}
                {props.person.supervisor && (
                  <p className='person-label'>Supervisor</p>
                )}
              </div>
              <div>
                {props.person.email && <p>{props.person.email}</p>}
                {props.person.userId && <p>{props.person.userId}</p>}
                {props.person.homePhone && <p>{props.person.homePhone}</p>}
                {props.person.teamPhone && <p>{props.person.teamPhone}</p>}
                {props.person.supervisor && (
                  <p>{props.person.supervisor.name}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {props.person.tags && (
          <div className='person-col'>
            <h4>Tags</h4>
            <p>{props.person.tags}</p>
          </div>
        )}
      </div>
      {props.person.isSupervisor && (
        <div className='person-col'>
          <h4>Supervisor</h4>
          <p>
            <a
              href={`/${context.team.slug}/Report/SupervisorDirectReports/?personId=${props.person.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button color='link'>
                <i
                  className='fas fa-search fa-sm fa-fw mr-2'
                  aria-hidden='true'
                />
                See who this person supervises
              </Button>
            </a>
          </p>
        </div>
      )}
      {props.person.notes && (
        <div className='notes-deets'>
          <h4>Notes</h4>
          <p className='card-text'>{props.person.notes}</p>
        </div>
      )}
    </div>
  );
};

export default BioContainer;
