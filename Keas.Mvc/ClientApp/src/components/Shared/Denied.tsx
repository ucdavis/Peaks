import * as React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface IProps {
  viewName: string;
}

const Denied = (props: IProps) => {
  return (
    <section className='max-w-3xl space-y-6 py-6'>
      <InformationCircleIcon className='size-10 text-info' aria-hidden='true' />
      <h1 className='m-0 text-3xl font-semibold text-base-content'>{props.viewName}</h1>
      <p className='m-0 text-lg leading-7 text-base-content/70'>You do not have permission to see {props.viewName}.</p>
      <p className='m-0 text-base-content/70'>Contact your team admin if you need access, or choose another team.</p>
      <a href='/Confirm/SelectTeam' className='link link-hover text-primary'>Select a team</a>
    </section>
  );
};

export default Denied;
