import * as React from 'react';
import {
  UsersIcon,
  ComputerDesktopIcon,
  IdentificationIcon,
  KeyIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/solid';

const loaderIcons = [
  { Icon: UsersIcon, assetClass: 'people-color', delay: '0s' },
  { Icon: ComputerDesktopIcon, assetClass: 'equipment-color', delay: '0.6s' },
  { Icon: IdentificationIcon, assetClass: 'access-color', delay: '1.2s' },
  { Icon: KeyIcon, assetClass: 'keys-color', delay: '1.8s' },
  { Icon: BuildingOffice2Icon, assetClass: 'spaces-color', delay: '2.4s' }
];

export const PeaksLoader = () => (
  <div role='status' className='flex min-h-12 items-center justify-center'>
    <span className='sr-only'>Loading…</span>
    <div aria-hidden='true' className='flex items-center gap-2'>
      {loaderIcons.map(({ Icon, assetClass, delay }) => (
        <span
          key={assetClass}
          className={`peaks-loader-icon ${assetClass}`}
          style={{ animationDelay: delay }}
        >
          <Icon className='size-5' />
        </span>
      ))}
    </div>
  </div>
);

export default PeaksLoader;
