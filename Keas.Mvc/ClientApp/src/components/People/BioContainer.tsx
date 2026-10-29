import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useContext } from 'react';
import { Context } from '../../Context';
import { IPerson } from '../../models/People';
import { DateUtil } from '../../util/dates';

interface IProps {
  person: IPerson;
}

const Detail = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className='grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 text-sm'>
    <dt className='text-base-content/60'>{label}</dt>
    <dd className='m-0 min-w-0 break-words'>{children}</dd>
  </div>
);

const BioContainer = ({ person }: IProps) => {
  const context = useContext(Context);
  const hasEmployment =
    person.title || person.category || person.startDate || person.endDate;
  const hasContact =
    person.email ||
    person.userId ||
    person.homePhone ||
    person.teamPhone ||
    person.supervisor ||
    person.isSupervisor;
  const tags = Array.from(
    new Set(
      (person.tags || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    )
  );

  return (
    <div className='card-body gap-6 p-5 sm:p-6'>
      <div className='grid items-start gap-8 md:grid-cols-2 xl:grid-cols-3'>
        {hasEmployment && (
          <section
            className='flex min-w-0 flex-col gap-4'
            aria-label='Employment details'
          >
            <h3 className='m-0 text-base font-semibold'>Employment details</h3>
            <dl className='m-0 grid gap-3'>
              {person.title && <Detail label='Title'>{person.title}</Detail>}
              {person.category && (
                <Detail label='Category'>{person.category}</Detail>
              )}
              {person.startDate && (
                <Detail label='Start date'>
                  {DateUtil.formatExpiration(person.startDate)}
                </Detail>
              )}
              {person.endDate && (
                <Detail label='End date'>
                  {DateUtil.formatExpiration(person.endDate)}
                </Detail>
              )}
            </dl>
          </section>
        )}
        {hasContact && (
          <section className='flex min-w-0 flex-col gap-4' aria-label='Contact details'>
            <h3 className='m-0 text-base font-semibold'>Contact details</h3>
            <dl className='m-0 grid gap-3'>
              {person.email && (
                <Detail label='Email'>
                  <a
                    className='link link-hover'
                    href={`mailto:${person.email}`}
                  >
                    {person.email}
                  </a>
                </Detail>
              )}
              {person.userId && (
                <Detail label='User ID'>{person.userId}</Detail>
              )}
              {person.homePhone && (
                <Detail label='Home phone'>
                  <a
                    className='link link-hover'
                    href={`tel:${person.homePhone}`}
                  >
                    {person.homePhone}
                  </a>
                </Detail>
              )}
              {person.teamPhone && (
                <Detail label='Team phone'>
                  <a
                    className='link link-hover'
                    href={`tel:${person.teamPhone}`}
                  >
                    {person.teamPhone}
                  </a>
                </Detail>
              )}
              {person.supervisor && (
                <Detail label='Supervisor'>{person.supervisor.name}</Detail>
              )}
            </dl>
            {person.isSupervisor && (
              <a
                className='link link-hover inline-flex items-center gap-2 text-sm'
                href={`/${context.team.slug}/Report/SupervisorDirectReports/?personId=${person.id}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <MagnifyingGlassIcon
                  className='size-4 shrink-0'
                  aria-hidden='true'
                />
                View direct reports
              </a>
            )}
          </section>
        )}
        {tags.length > 0 && (
          <section className='flex min-w-0 flex-col gap-4' aria-label='Person tags'>
            <h3 className='m-0 text-base font-semibold'>Tags</h3>
            <div className='flex flex-wrap gap-2'>
              {tags.map(tag => (
                <span
                  key={tag}
                  className='badge badge-asset badge-soft h-auto max-w-full break-words py-2'
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
      {person.notes && (
        <section
          className='flex flex-col gap-3 border-t border-main-border pt-5'
          aria-label='Person notes'
        >
          <h3 className='m-0 text-base font-semibold'>Notes</h3>
          <p className='m-0 whitespace-pre-wrap break-words text-sm text-base-content/80'>
            {person.notes}
          </p>
        </section>
      )}
    </div>
  );
};

export default BioContainer;
